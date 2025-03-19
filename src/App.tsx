import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import { DirtyProvider } from "./contexts/DirtyProvider";
import { router } from "./routes/router";
// @ts-ignore */

function App() {

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "Roboto",
          },
        }}
      >
        <DirtyProvider>
          <RouterProvider router={router} />
        </DirtyProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
