import {
  createOtpCookieValue,
  generateOtp,
  getOtpCookieName,
  getOtpCookieOptions,
  getSmsNumber,
  sendOtpSms,
  validatePhoneForCountry,
  verifyOtpFromCookie,
} from "@/lib/otp";

import {
  jsonError,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";

import { cookies } from "next/headers";
import { after } from "next/server";

import {
  createEmailOtpSession,
  getClientMeta,
  getEmailOtpCookieName,
  getEmailOtpCookieOptions,
  isInternationalRequest,
  verifyEmailOtpSession,
} from "@/lib/email-otp";

import { notifyAdminOfMicroEnquiry } from "@/lib/micro-enquiry";

type Country =
  | "India"
  | "UAE"
  | "UK"
  | "Singapore"
  | "USA";

type OtpRequest = {
  action?: "send" | "verify";
  phone?: string;
  country?: Country;
  otp?: string;

  fullName?: string;
  email?: string;
  contactNumber?: string;
  subject?: string;
  message?: string;
};
export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json().catch(
        () => ({})
      )) as OtpRequest;

    const action = body.action;
    const phone = body.phone?.trim();
    const country = body.country || "India";

    if (
      action !== "send" &&
      action !== "verify"
    ) {
      return jsonError(
        "Action must be send or verify."
      );
    }

    if (!phone) {
      return jsonError(
        "Phone number is required."
      );
    }

    const phoneError =
      validatePhoneForCountry(
        phone,
        country
      );

    if (phoneError) {
      return jsonError(phoneError);
    }

    const smsNumber = getSmsNumber(
      phone,
      country
    );

    // =====================================
    // INTERNATIONAL (EMAIL OTP) HANDLER
    // SMS provider supports Indian numbers only,
    // so every other country is verified via email.
    // =====================================

    if (isInternationalRequest(country)) {
      const cookieStore = await cookies();

      if (action === "send") {
        const { ipAddress, userAgent } = getClientMeta(request);

        const enquiry = {
          fullName: body.fullName?.trim(),
          email: body.email?.trim(),
          contactNumber: body.contactNumber?.trim() || phone,
          phone: smsNumber,
          country,
          subject: body.subject?.trim(),
          message: body.message?.trim(),
        };

        const result = await createEmailOtpSession({
          phone: smsNumber,
          country,
          email: body.email,
          enquiry,
          ipAddress,
          userAgent,
        });

        if (!result.ok) {
          return jsonError(result.error, result.status);
        }

        const { sessionId, maskedEmail } = result.data;

        cookieStore.set(
          getEmailOtpCookieName(),
          sessionId,
          getEmailOtpCookieOptions()
        );

        // Micro-enquiry: alert admin with the full enquiry
        // even though the OTP is not verified yet.
        // Runs after the response so the user isn't kept waiting.
        after(async () => {
          try {
            await notifyAdminOfMicroEnquiry(enquiry, {
              sessionId,
              ipAddress,
              userAgent,
            });
          } catch (err) {
            console.error("[micro-enquiry] Admin notification failed:", err);
          }
        });

        return jsonSuccess({
          sent: true,
          channel: "email",
          message: `OTP sent to ${maskedEmail}.`,
        });
      }

      // verify
      if (!body.otp) {
        return jsonError("OTP code is required.");
      }

      const verifyError = await verifyEmailOtpSession(
        cookieStore.get(getEmailOtpCookieName())?.value,
        smsNumber,
        body.otp
      );

      if (verifyError) {
        return jsonError(verifyError);
      }

      cookieStore.delete(getEmailOtpCookieName());

      return jsonSuccess({
        verified: true,
        message: "Verified successfully.",
      });
    }

    // =====================================
    // SEND OTP
    // =====================================

    if (action === "send") {
      const cookieStore = await cookies();

      const existingCookie =
        cookieStore.get(
          getOtpCookieName()
        )?.value;

      if (existingCookie) {
        const lastSentWait =
          require("@/lib/otp").assertCanResend(
            existingCookie
          );

        if (lastSentWait) {
          return jsonError(
            `Please wait ${lastSentWait} seconds before requesting another OTP.`
          );
        }
      }

      const otp = generateOtp();

      console.log(
        "[OTP] Sending OTP to:",
        smsNumber
      );

      // Don't log OTP in production.
      console.log(
        "[OTP] Generated OTP:",
        otp
      );

      const smsResponse =
        await sendOtpSms(
          smsNumber,
          otp
        );

      console.log(
        "[OTP] SMS provider response:",
        smsResponse
      );

      const cookieValue =
        createOtpCookieValue(
          smsNumber,
          otp
        );

      cookieStore.set(
        getOtpCookieName(),
        cookieValue,
        getOtpCookieOptions()
      );

      return jsonSuccess({
        sent: true,
        message:
          "OTP sent successfully.",
        providerResponse:
          process.env.NODE_ENV ===
            "development"
            ? smsResponse
            : undefined,
      });
    }

    // =====================================
    // VERIFY OTP
    // =====================================

    if (!body.otp) {
      return jsonError(
        "OTP code is required."
      );
    }

    const cookieStore =
      await cookies();

    const cookieValue =
      cookieStore.get(
        getOtpCookieName()
      )?.value;

    if (!cookieValue) {
      return jsonError(
        "No OTP found. Please request a new OTP."
      );
    }

    const error =
      verifyOtpFromCookie(
        cookieValue,
        smsNumber,
        body.otp
      );

    if (error) {
      return jsonError(error);
    }

    // OTP verified successfully.
    cookieStore.delete(
      getOtpCookieName()
    );

    return jsonSuccess({
      verified: true,
      message:
        "Phone number verified successfully.",
    });
  } catch (error) {
    console.error(
      "[OTP] Error:",
      error
    );

    return jsonServerError(
      error instanceof Error
        ? error.message
        : "OTP request failed."
    );
  }
}