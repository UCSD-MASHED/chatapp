// import { render, screen, fireEvent } from "@testing-library/react";
// import App from "../App";
// import '@testing-library/jest-dom/extend-expect';
// import { useCollectionData } from 'react-firebase-hooks/firestore';

// // mocking userCollectionData react-firestore hook
// jest.mock('react-firebase-hooks/firestore', () => ({
//   useCollectionData: jest
//     .fn()
//     .mockName('useCollectionData')
//     .mockReturnValue([])
// }))

// test("renders learn react link", () => {
//   render(<App />);
//   const linkElement = screen.getByText(/TaterTalks/i);
//   expect(linkElement).toBeInTheDocument();
// });

// test("test ChatRoom to display chat messages", () => {
//   ;(useCollectionData as any).mockReturnValueOnce([
//     { id: "0", message: "test message", timestamp: "mock_timestamp_1", userId: "test_user" }
//   ])
//   render(<App />);
//   const linkElement = screen.getByText(/test message/i);
//   expect(linkElement).toBeInTheDocument();
// });

// // describe("setDocData", () => {
// //   const mockData = { fake: "data" };
// //   beforeEach(() => {
// //     jest.clearAllMocks();
// //     ChatRoom();
// //   });

// //   it("writes the correct doc", () => {
// //     expect(firestore().doc).toHaveBeenCalledTimes(1);
// //   });

// //   it("adds a timestamp, and writes it to the doc", () => {
// //     expect(firestore().doc().set).toHaveBeenCalledWith({
// //       created: "MOCK_TIME",
// //       fake: "data"
// //     });
// //   });
// // });
