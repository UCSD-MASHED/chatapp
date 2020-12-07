import React from "react";
import classNames from "classnames";

// const ansImages = ["/ans1.png", "/ans2.png"];

class Jokes extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const jokeImages = [
      "/joke1.png",
      "/joke2.png",
      "/joke3.png",
      "/joke4.png",
      "/joke5.png",
    ];
    const ansImages = [
      "/ans1.png",
      "/ans2.png",
      "/ans3.png",
      "/ans4.png",
      "/ans5.png",
    ];

    let jokeFadeIn = classNames({
      "joke-img": true,
      "fade-out": false,
      "fade-in": true,
    });
    let jokeFadeOut = classNames({
      "joke-img": true,
      "fade-out": true,
      "fade-in": false,
    });
    let ansFadeIn = classNames({
      "ans-img": true,
      "fade-out": false,
      "fade-in": true,
    });
    let ansFadeOut = classNames({
      "ans-img": true,
      "fade-out": true,
      "fade-in": false,
    });
    return (
      <span>
        {jokeImages.map((imgPath, index) => (
          <img
            key={index}
            className={index === this.props.imgState ? jokeFadeIn : jokeFadeOut}
            src={process.env.PUBLIC_URL + imgPath}
            alt={"joke"}
          />
        ))}
        {ansImages.map((imgPath, index) => (
          <img
            key={index}
            className={index === this.props.imgState ? ansFadeIn : ansFadeOut}
            src={process.env.PUBLIC_URL + imgPath}
            alt={"ans"}
          />
        ))}
      </span>
    );
  }
}
export default Jokes;
