import { Button, Modal } from "react-bootstrap";

function FullScreenImageModal(props) {
  return (
    <Modal
      {...props}
      fullscreen
      centered
      className="fullscreen-image-modal"
      backdrop="static"
    >
      <Modal.Header className="bg-transparent border-0 p-3 d-flex justify-content-end" style={{ position: "absolute", top: 0, right: 0, zIndex: 100, width: "auto" }}>
        <Button 
          onClick={props.onHide} 
          className="btn btn-close btn-close-white bg-transparent"
          aria-label="Close"
          // style={{ padding: "0.5rem", minWidth: "40px", minHeight: "40px" }}
        />
      </Modal.Header>
      <Modal.Body className="p-0 d-flex align-items-center justify-content-center bg-dark" style={{ height: "100vh" }}>
        <img 
          src={props.selectedImage} 
          alt="Full Screen" 
          style={{ 
            maxWidth: "100%", 
            maxHeight: "100%", 
            objectFit: "contain",
            width: "auto",
            height: "auto"
          }} 
        />
      </Modal.Body>
    </Modal>
  );
}

export default FullScreenImageModal