import React from 'react'
import HashLoader from 'react-spinners/HashLoader'

const GlobalLoader = () => {
    return (
        <div className="overlay-loader position-fixed">
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <HashLoader color="rgb(25, 117, 178)" size={50} />
            </div>
        </div>
    )
}

export default GlobalLoader