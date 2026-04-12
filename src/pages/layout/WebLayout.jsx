import { Fragment } from "react";
import LayoutBinded from ".";

const WebLayout = ({ children, isFooter, isHeader, isSideBar, refreshNotification }) => {
  return (
    <Fragment>
      <LayoutBinded children={children} isFooter={isFooter} isHeader={isHeader} isSideBar={isSideBar} refreshNotification={refreshNotification} />
    </Fragment>
  );
};

export default WebLayout;
