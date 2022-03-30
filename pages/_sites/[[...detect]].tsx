import { FC } from "react";
import type { GetStaticProps, GetStaticPaths, GetServerSideProps } from "next";

type PropsType = {
  myData: any;
};

const Detect: FC<PropsType> = ({ myData }) => {
  // console.log("myData", myData);

  return (
    <>
      <div>Энд сайт гарч байна. Энэ бол Detect юм.</div>
      <div className="mt-10 bg-yellow-100 p-10">{myData}</div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  // ...
  console.log("getStaticProps context", context);

  return {
    props: {
      myData: `Энэ бол getStaticProps-оос ирсэн дата юм. ${Math.floor(
        Math.random() * 10
      )}`,
    },
    revalidate: 1 * 60 * 5, //60 seconds * 5 minutes
  };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export default Detect;
