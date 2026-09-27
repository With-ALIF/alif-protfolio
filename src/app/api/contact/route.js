import { Contact } from "@/models/Contact";
import { dbConnect } from "@/utils/dbConnect";
import { NextResponse } from "next/server";

// Best-effort archive for messages already sent from the client via EmailJS.
// Never fails the request: the email is the source of truth.
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const newContact = await Contact.create({ name, email, subject, message });
    return NextResponse.json({ success: true, data: newContact });
  } catch {
    return NextResponse.json({ success: true, archived: false });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
