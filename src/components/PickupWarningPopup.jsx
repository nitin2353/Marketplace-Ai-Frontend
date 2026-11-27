import { Alert } from "react-bootstrap";
import { FaTruck, FaExclamationTriangle } from "react-icons/fa";

const PickupWarningPopup = ({ pickupServiceable, onCheckAgain }) => {
  if (pickupServiceable !== false) return null;

  return (
    <div
      className="position-fixed"
      style={{
        right: "15px",
        top: "120px",
        width: "260px",
        zIndex: 1050,
      }}
    >
      <Alert
        variant="warning"
        className="shadow-sm border-warning rounded-3 p-3 mb-0"
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <FaExclamationTriangle className="text-warning" />
          <strong style={{ fontSize: "14px" }}>
            Pickup Unavailable
          </strong>
        </div>

        <p className="small mb-2">
          Courier pickup is not available at your address yet. Your products
          will remain hidden from customers until pickup service becomes
          available.
        </p>
      </Alert>
    </div>
  );
};

export default PickupWarningPopup;