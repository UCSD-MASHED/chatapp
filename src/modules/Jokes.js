import React from "react";
import classNames from "classnames";

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

const jokeFadeIn = classNames({
  "joke-img": true,
  "fade-out": false,
  "fade-in": true,
});
const jokeFadeOut = classNames({
  "joke-img": true,
  "fade-out": true,
  "fade-in": false,
});
const ansFadeIn = classNames({
  "ans-img": true,
  "fade-out": false,
  "fade-in": true,
});
const ansFadeOut = classNames({
  "ans-img": true,
  "fade-out": true,
  "fade-in": false,
});

/**
 * This is the Jokes Component used to render jokes and answers images.
 */
class Jokes extends React.Component {

  /**
   * Helper function to display images
   * @param {string[]} images - list of image names
   * @param {boolean} isJoke - true if the images are joke images, false if answer images
   */
  displayImgs(images, isJoke) {
    return images.map((imgPath, index) => (
      <img
        key={index}
        className={
          isJoke
            ? index === this.props.imgState
              ? jokeFadeIn
              : jokeFadeOut
            : index === this.props.imgState
            ? ansFadeIn
            : ansFadeOut
        }
        src={process.env.PUBLIC_URL + imgPath}
        alt={isJoke ? "joke" : "ans"}
      />
    ));
  } /* displayImgs */

  render() {
    return (
      <span>
        {this.displayImgs(jokeImages, true)}
        {this.displayImgs(ansImages, false)}
      </span>
    );
  }
}
export default Jokes;
