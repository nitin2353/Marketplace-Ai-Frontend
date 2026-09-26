import WebFooter from "./layout/common/WebFooter";
import WebHeader from "./layout/common/WebHeader";
import WebSideBar from "./layout/common/WebSideBar";
import { useState } from "react";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { MoonLoader } from "react-spinners";
import AppLoader from "../../components/AppLoader";

const LayoutBinded = ({ children, isSideBar, isHeader, isFooter }) => {
  const [refreshNotification, setRefreshNotification] = useState(false);
  const { setRefreshTable, user } = useAuthWrapper();

  if (!user) {
    return <AppLoader />;
  }

  return (
    <div className="content-wrapper">
      <div className="wrapper-content d-flex">
        <nav className={"show"} id="sidebar">
          {isSideBar && <WebSideBar />}
        </nav>

        <div className="flex-column" style={{ width: "100%" }}>
          {isHeader && (
            <WebHeader
              setRefreshTable={setRefreshTable}
              refreshNotification={refreshNotification}
              setRefreshNotification={setRefreshNotification}
            />
          )}

          <main style={{ marginBottom: "5rem" }}>{children}</main>

          {isFooter && <WebFooter />}
        </div>
      </div>
    </div>
  );
};

export default LayoutBinded;