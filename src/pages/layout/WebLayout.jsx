import { Fragment } from "react";
import LayoutBinded from ".";

const WebLayout = ({ children, isFooter, isHeader, isSideBar, refreshNotification }) => {
  return (
    <>
      <LayoutBinded children={children} isFooter={isFooter} isHeader={isHeader} isSideBar={isSideBar} refreshNotification={refreshNotification} />
    </>
  );
};

export default WebLayout;
