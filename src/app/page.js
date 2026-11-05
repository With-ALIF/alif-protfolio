export const dynamic = "force-dynamic";
import Landing from "./components/Landing/Landing";
import { getCmsBundle } from "@/lib/cms";
import { getGitHubStats } from "@/lib/github";

const Page = async () => {
  const [cms, githubStats] = await Promise.all([getCmsBundle(), getGitHubStats()]);

  return (
    <div>
      <Landing cms={cms} githubStats={githubStats} />
    </div>
  );
};

export default Page;
