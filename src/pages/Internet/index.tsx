import { useEffect } from "react";

const Internet = () => {
  useEffect(() => {
    const webview = document.querySelector("webview");
    if (webview) {
      webview.addEventListener("did-finish-load", () => {
        console.log("webview loaded google");
      });
    }
  }, []);

  return (
    <div className="w-full h-full bg-white rounded-md shadow-md overflow-hidden">
      <webview
        src="https://www.google.com"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default Internet;

// const Internet = () => {
//   return (
//     <div className="flex flex-col gap-10">
//       <div>
//         <h1 className="text-3xl text-bold">Demo Button</h1>
//         <div>
//           <div className="flex flex-wrap gap-4 p-6">
//             <Button variant="primary">Button</Button>
//             <Button
//               variant="primary"
//               iconLeft={<HomeIcon className="w-4 h-4" />}
//             >
//               Button
//             </Button>
//             <Button
//               variant="primary"
//               iconRight={<HomeIcon className="w-4 h-4" />}
//             >
//               Button
//             </Button>
//             <Button variant="primary" outline>
//               Button
//             </Button>
//             <Button variant="primary" soft>
//               Button
//             </Button>
//             <Button variant="primary" disabled>
//               Button
//             </Button>

//             <Button variant="accept">Accept</Button>
//             <Button variant="error">Error</Button>
//             <Button variant="neutral">Neutral</Button>
//             <Button variant="dark">Dark</Button>
//             <Button size="sm">Small</Button>
//             <Button size="md">Medium</Button>
//             <Button size="lg">Large</Button>
//           </div>
//         </div>
//       </div>

//       <div>
//         <h1 className="text-3xl text-bold">Demo Badge</h1>
//         <div>
//           <div className="flex flex-wrap gap-4 p-6">
//             <Badge variant="primary">Primary</Badge>
//             <Badge variant="primary" outline>
//               Primary
//             </Badge>
//             <Badge variant="primary" soft>
//               Primary
//             </Badge>

//             <Badge variant="accept" iconLeft={<Dot className="w-3 h-3" />}>
//               Success
//             </Badge>
//             <Badge variant="error" iconRight={<Dot className="w-3 h-3" />}>
//               Error
//             </Badge>
//             <Badge variant="neutral">Neutral</Badge>
//             <Badge variant="dark">Dark</Badge>
//             <Badge size="sm">Small</Badge>
//             <Badge size="md">Medium</Badge>
//             <Badge size="lg">Large</Badge>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Internet;
