import { render, screen } from "@testing-library/react";
import App from "../App";

test("write test name here", () => {
  render(<App />);
  const linkElement = screen.getByText(/learn/i);
  expect(linkElement).toBeInTheDocument();
});
