export const dynamic = "force-dynamic";
import Landing from "./components/Landing/Landing";
import { getCmsBundle } from "@/lib/cms";

const Page = async () => {
  const cms = await getCmsBundle();

  return (
    <div>
      <Landing cms={cms} />
    </div>
  );
};

export default Page;
