import dynamic from "next/dynamic";

const MailPage = dynamic(() => import("@/app/mail/index"), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

const Home = () => {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-4">
          {/* <UserButton /> */}
          {/* <ModeToggle /> */}
          {/* <ComposeButton /> */}
          {/* {process.env.NODE_ENV === "development" && <WebhookDebugger />} */}
        </div>
      </div>

      {/* <div className="border-b ">
      <TopAccountSwitcher />
    </div> */}
      <MailPage />
    </>
  );
};

export default Home;
