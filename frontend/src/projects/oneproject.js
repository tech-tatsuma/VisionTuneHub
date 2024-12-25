import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ image, title, price, pid }) => {
    const backendurl = process.env.REACT_APP_BACKEND_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const checkImageExists = async () => {
            try {
                const apiImageUrl = `${backendurl}/images${image.replace(
                    "/4ovisionannotator/backend/datas",
                    ""
                )}`;
                const response = await fetch(apiImageUrl, { method: "HEAD" });
                console.log("Image check:", apiImageUrl, response.ok);
            } catch (error) {
                console.error("Image check failed:", error);
            }
        };
        checkImageExists();
    }, [image, backendurl]);

    const imageUrl = `${backendurl}/images${image.replace(
        "/4ovisionannotator/backend/datas",
        ""
    )}`;
    console.log("Image URL:", imageUrl);

    // カードクリック時に/annotation/:pidに遷移
    const handleCardClick = () => {
        navigate(`/annotation/${pid}`);
    };

    return (
        <div className="max-w-[200px] flex flex-col items-center justify-center gap-3 pb-3 hover:shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out border border-gray-300 rounded-xl p-4" onClick={handleCardClick}>
            <div
                className="w-full h-[200px] bg-center bg-no-repeat bg-cover rounded-lg"
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundColor: "#f0f0f0",
                }}
            ></div>
            <div className="flex flex-col items-center justify-center text-center">
                <p className="text-[#111318] text-base font-medium leading-normal">{title}</p>
                {price && (
                    <p className="text-[#636f88] text-sm font-normal leading-normal">{price}</p>
                )}
            </div>
        </div>
    );
};

export default ProductCard;