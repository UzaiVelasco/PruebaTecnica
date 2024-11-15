import "./BasicLayout.css";
export function BasicLayout(props) {
  const { children } = props;
  return <div className="basic-layout-container">{children}</div>;
}
