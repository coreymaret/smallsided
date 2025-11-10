import fetch from "node-fetch";

interface EventBody {
  token: string;
}

export const handler = async (event: any, context: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body: EventBody;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const token = body.token;
  if (!token) {
    return { statusCode: 400, body: JSON.stringify({ success: false, msg: "Missing token" }) };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY; // store this in Netlify Environment Variables

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);

  try {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      body: params,
    });
    const data = await response.json();

    if (data.success) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } else {
      return { statusCode: 400, body: JSON.stringify({ success: false, msg: "reCAPTCHA verification failed" }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, msg: "Server error" }) };
  }
};
