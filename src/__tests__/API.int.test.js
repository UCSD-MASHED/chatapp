import { render, screen } from "@testing-library/react";
import App from "../App";
import '@testing-library/jest-dom/extend-expect';


test("write test name here", () => {
  render(<App />);
  const linkElement = screen.getByText(/TaterTalks/i);
  expect(linkElement).toBeInTheDocument();
});
