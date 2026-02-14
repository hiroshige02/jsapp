import { Routes, Route } from "react-router-dom";
import { routes } from "./routes";

// TODO: lazyLoadして初期表示を早くしたい
const AppRouter = () => (
  <Routes>
    {routes.map(({ path, Page }, i) => (
      <Route key={i} path={path} element={<Page />} />
    ))}
  </Routes>
);

export default AppRouter;
