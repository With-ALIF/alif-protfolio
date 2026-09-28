import { siteProfile } from '@/data/site';

export default function Footer({ profile = siteProfile }) {
  return (
    <footer className="border-t border-white/10 bg-[#0f0f0f] py-8 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-center">
          <div>
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-zinc-400">{profile.role}</p>
          </div>
        </div>

        <div className="my-6 border-t border-gray-700 w-full" />

        <p className="text-center text-sm text-zinc-400">
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
