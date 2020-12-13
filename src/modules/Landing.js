import React from "react";
import classNames from "classnames";

const images = [
    "/landing_illustration_0.png",
    "/landing_illustration_1.png",
    "/landing_illustration_2.png",
    "/landing_illustration_3.png",
    "/landing_illustration_4.png",
]

const fadeIn = classNames({
    "d-none": true,
    "d-md-block": true,
    "landing-img": true,
    "fade-out": false,
    "fade-in": true,
});
const fadeOut = classNames({
    "d-none": true,
    "d-md-block": true,
    "landing-img": true,
    "fade-out": true,
    "fade-in": false,
});

class Landing extends React.Component {
    displayImgs() {
        return images.map((imgPath, index) => (
            <img
                key={index}
                className={
                    index === this.props.imgState
                        ? fadeIn
                        : fadeOut
                }
                src={process.env.PUBLIC_URL + imgPath}
                alt={"illustration"}
            />
        ));
    }

    render() {
        return (
            <span>
                {this.displayImgs()}
            </span>
        );
    }
}
export default Landing;