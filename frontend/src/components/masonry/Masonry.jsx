// // create me a masonry component that can take any form of data and render in a section. Each data object should be rendered in a card with the resizable feature. In the section all the items should be draggable, replaceable, and can be added into groups.
// //
// // The masonry component should be able to take the following props:
// //
// // data: array of objects - each object should have an id, title, description, image
// //
// // groups: array of objects - each object should have an id, title, description, image
// //
// // The masonry component should have the following features:
// //
// // Each card should be resizable
// // Each card should be draggable
// // Each card should be replaceable
// // Each card should be able to be added into groups
// //
// // You can use any library or write your own code.
// //
// // You can use the following libraries:
// //
// // react-resizable
// // react-draggable
// // react-beautiful-dnd
// // react-masonry-css

// import React, { useState } from "react";
// import { Resizable } from "react-resizable";
// import { Draggable } from "react-beautiful-dnd";
// import { Masonry } from "react-masonry-css";

// const MasonryComponent = ({ data, groups }) => {
//   const [cards, setCards] = useState(data);

//   const onResize =
//     (index) =>
//     (e, { size }) => {
//       setCards((prevCards) => {
//         const newCards = [...prevCards];
//         newCards[index].size = size;
//         return newCards;
//       });
//     };

//   const onDragEnd = (result) => {
//     if (!result.destination) {
//       return;
//     }

//     const items = Array.from(cards);
//     const [reorderedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reorderedItem);

//     setCards(items);
//   };

//   return (
//     <Masonry
//       breakpointCols={{
//         default: 4,
//         1100: 3,
//         700: 2,
//         500: 1,
//       }}
//       className="my-masonry-grid"
//       columnClassName="my-masonry-grid_column"
//     >
//       {cards.map((card, index) => (
//         <Draggable key={card.id} draggableId={card.id} index={index}>
//           {(provided) => (
//             <div
//               ref={provided.innerRef}
//               {...provided.draggableProps}
//               {...provided.dragHandleProps}
//             >
//               <Resizable
//                 width={card.size.width}
//                 height={card.size.height}
//                 onResize={onResize(index)}
//               >
//                 <div>
//                   <img src={card.image} alt={card.title} />
//                   <h3>{card.title}</h3>
//                   <p>{card.description}</p>
//                 </div>
//               </Resizable>
//             </div>
//           )}
//         </Draggable>
//       ))}
//     </Masonry>
//   );
// };
