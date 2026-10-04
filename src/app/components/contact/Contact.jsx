"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaEnvelope, FaMapMarkerAlt, FaLinkedin, FaGithub, FaFacebook, FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useState } from "react";
import { sendContactEmail } from "@/lib/emailjs";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactForm({ profile = { socials: {} } }) {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      return "Please complete every field before sending your message.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address.";
    }
    if (formData.message.trim().length < 10) {
      return "Please add a little more detail to your message.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await sendContactEmail(formData);

      setFormData(initialForm);
      setStatus({
        type: "success",
        message: "Thanks for reaching out. I will get back to you soon.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Message sending failed. You can email me directly instead.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="text-white">
      <div className="mx-auto grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.aside
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-lg border border-white/10 bg-zinc-900/70 p-6"
        >
          <p className="text-sm font-semibold uppercase text-blue-300">Get in touch</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal">
            <span className="text-gradient">Contact</span>
          </h1>
          <p className="mt-4 leading-7 text-zinc-300">
            Let&apos;s work together. Send a project idea, role opportunity, or
            collaboration request. I usually reply as soon as possible.
          </p>

          <div className="mt-8 space-y-5">
            <a href={`mailto:${profile.email}`} className="flex items-center gap-4 text-zinc-200 hover:text-white">
              <FaEnvelope className="text-xl text-blue-300" />
              <span>{profile.email}</span>
            </a>
            <div className="flex items-center gap-4 text-zinc-200">
              <FaMapMarkerAlt className="text-xl text-blue-300" />
              <span>{profile.location}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link aria-label="LinkedIn profile" href={profile.socials.linkedin} target="_blank" className="rounded-full border border-white/10 p-3 hover:bg-white/10">
              <FaLinkedin className="text-2xl" />
            </Link>
            <Link aria-label="GitHub profile" href={profile.socials.github} target="_blank" className="rounded-full border border-white/10 p-3 hover:bg-white/10">
              <FaGithub className="text-2xl" />
            </Link>
            <Link aria-label="Facebook profile" href={profile.socials.facebook} target="_blank" className="rounded-full border border-white/10 p-3 hover:bg-white/10">
              <FaFacebook className="text-2xl" />
            </Link>
            <Link aria-label="Telegram profile" href={profile.socials.telegram} target="_blank" className="rounded-full border border-white/10 p-3 hover:bg-white/10">
              <FaTelegram className="text-2xl" />
            </Link>
            <Link aria-label="WhatsApp profile" href={profile.socials.whatsapp} target="_blank" className="rounded-full border border-white/10 p-3 hover:bg-white/10">
              <FaWhatsapp className="text-2xl" />
            </Link>
            <Link aria-label="Instagram profile" href={profile.socials.instagram} target="_blank" className="rounded-full border border-white/10 p-3 hover:bg-white/10">
              <FaInstagram className="text-2xl" />
            </Link>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-lg border border-white/10 bg-zinc-900/70 p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-300">Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-300">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
                  autoComplete="email"
                  required
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-zinc-300">Subject</span>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-300">Message</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
                required
              />
            </label>

            {status.message && (
              <p
                role="status"
                className={`rounded-lg border p-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border-red-400/30 bg-red-500/10 text-red-200"
                }`}
              >
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
