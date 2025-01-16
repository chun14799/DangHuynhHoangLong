import React from "react";

const TokenImage: React.FC<{ token: string }> = ({ token }) => {
    return (
        <div>
            <img
                src={`/tokens/${token}.svg`} // Dynamically construct path
                alt={`${token} token`}
                style={{ width: 50, height: 50 }}
            />
        </div>
    );
};

export default TokenImage;