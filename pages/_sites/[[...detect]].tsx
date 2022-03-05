import { FC } from "react";
import type { GetStaticProps, GetStaticPaths, GetServerSideProps } from "next";

type PropsType = {
  myData: any;
};

const Detect: FC<PropsType> = ({ myData }) => {
  console.log("myData", myData);

  return <>Энд сайт гарч байна.</>;
};

export const getStaticProps: GetStaticProps = async (context) => {
  // ...
  console.log("context", context);
  return {
    props: {
      myData: "dfsdfdsfdsf",
    },
  };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export default Detect;
