import React from "react";
import classNames from "classnames";

const landingImages = [
  "/landing_illustration_0.png",
  "/landing_illustration_1.png",
  "/landing_illustration_2.png",
  "/landing_illustration_3.png",
  "/landing_illustration_4.png",
];

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

<<<<<<< HEAD
class Jokes extends React.Component {
=======
/**
 * This is the Jokes Component used to render jokes and answers images.
 * @hideconstructor
 */
class Jokes extends React.Component {
  /**
   * Helper function to display images
   * @param {string[]} images - list of images
   * @param {int} imgState - an integer indicator used for cycling through each of the images
   */
>>>>>>> 08bae14b526937cfdea17919136b6f0cdce66ce6
  displayImgs(images, imgState) {
    return images.map((imgPath, index) => (
      <img
        key={index}
        className={index === imgState ? fadeIn : fadeOut}
        src={process.env.PUBLIC_URL + imgPath}
        alt={"illustration"}
      />
    ));
<<<<<<< HEAD
  }
=======
  } /* displayImgs */
>>>>>>> 08bae14b526937cfdea17919136b6f0cdce66ce6

  render() {
    return <span>{this.displayImgs(landingImages, this.props.imgState)}</span>;
  }
}
export default Jokes;
