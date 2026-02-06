import React from 'react';

const ErrorCard = (props) => {
    return (
        <div className="error--card">
            <div className="error--card_body">
                <h5 className="error--card_title">{props.title}</h5>
                <p className="error--card_text">{props.message}</p>
            </div>
        </div>
    );
}

export default ErrorCard;