import { Button, Container } from "react-bootstrap"
import { useAuthWrapper } from "../helper/AuthWrapper"
import EditProfileModal from "./EditProfile";

const SidebarCard = ({ showModal, setShowModal }) => {
    const { user } = useAuthWrapper();

    return user ? (
        <Container fluid className="user-details border-bottom-2 text-center p-3">
            <div className="details">
                <img
                    src={user?.file_name || "/default-user.png"}
                    className="user-profile img-fluid img-responsive"
                    alt={user?.first_name || "User"}
                />
                <h4>{user?.postgresUser?.name || "Guest"}</h4>
                <div className="lead fs-6">{user?.postgresUser?.group_name || "User"}</div>
            </div>
            <Button className='w-50 custom-btn-primary' onClick={() => setShowModal(true)}>Edit Profile</Button>
            <EditProfileModal show={showModal} onHide={() => setShowModal(false)} />
        </Container>
    ) : <Container fluid className="user-details border-bottom-2 text-center p-3">
        <div className="details">
            <img
                src={"/default-user.png"}
                className="user-profile img-fluid img-responsive"
                alt={"User"}
            />
            <h4>{"Guest"}</h4>
            <div className="lead fs-6">{"User"}</div>
        </div>
    </Container>
}

export default SidebarCard;