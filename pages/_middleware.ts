import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const prepareDevelopmentHost = (hostname, pathname) => {
  //# prepare domain
  //['news', 'detail', 'common'] гэх мэтээр салгана.
  let tempPath = pathname.split("/").filter((el) => el);
  //Эхний элементийг салгаж domain-д өгнө.
  // const domain = tempPath.shift();
  const tempSub = "www";
  const tempDomain = tempPath.shift();
  const tempTld = "mn";

  //# prepare slug
  //үлдсэн үгсийг /-ээр холбож залгана.
  let tempSlug = tempPath.join("/");
  if (tempSlug === "") tempSlug = "home";

  return {
    domain: { subDomain: tempSub, rootDomain: tempDomain, tld: tempTld },
    slug: tempSlug,
  };
};

const prepareProductionHost = (hostname, pathname) => {
  console.log("prepareProductionHost hostname: ", hostname);
  console.log("prepareProductionHost pathname: ", pathname);

  //# prepare domain
  //['www', 'vercel', 'com'] гэх мэтээр салгана.
  let tempHost = hostname.split(".").filter((el) => el);

  let subDomain = tempHost.shift();
  let rootDomain = tempHost.shift();
  let tld = tempHost.shift();

  if (subDomain === "localhost:3000") {
    subDomain = "www";
    rootDomain = "localhost";
    tld = "mn";
  }

  //# prepare slug
  //['news', 'detail', 'common'] гэх мэтээр салгана.
  let tempPath = pathname.split("/").filter((el) => el);
  //үлдсэн үгсийг /-ээр холбож залгана.
  const tempSlug = tempPath.join("/");

  let hostObject = {
    domain: {},
    slug: "",
  };

  let domainType = "default";

  /*
  local
  localhost:3000/developer
  customer.veritech.mn/developer //dev руу дуудна
  page.veritech.mn/developer //cloud руу дуудна

  sub
  developer.interactive.mn

  default
  www.skyresort.mn
  */

  //check subhost
  const subList = ["interactive", "veritech"];
  if (subList.includes(rootDomain)) {
    domainType = "sub";
  }

  //check localhost
  const localList01 = ["vercel", "localhost"];
  if (localList01.includes(rootDomain)) {
    domainType = "local";
  }
  const localList02 = ["customer.veritech", "page.veritech"];
  if (localList02.includes(`${subDomain}.${rootDomain}`)) {
    domainType = "local";
  }

  switch (domainType) {
    case "default":
      hostObject = {
        domain: { subDomain: subDomain, rootDomain: rootDomain, tld: tld },
        slug: tempSlug,
      };
      break;
    case "local":
      hostObject = prepareDevelopmentHost(
        `${subDomain}.${rootDomain}.${tld}`,
        pathname
      );
      break;
    case "sub":
      hostObject = {
        domain: { subDomain: "www", rootDomain: subDomain, tld: tld },
        slug: tempSlug,
      };
      break;
    default:
      break;
  }

  return hostObject;
};

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const url = req.nextUrl.clone();

  const hostname = req.headers.get("host");
  const pathname = url.pathname;
  // const hostname = "localhost:3000";
  // const pathname = "/cozy/news/detail";

  let hostObject = {
    domain: {},
    slug: "",
  };

  if (
    !url.pathname.includes(".") && // exclude files public folder
    !url.pathname.startsWith("/api") // exclude API routes
  ) {
    console.log("\n\n---------------------- \n");
    console.log("hostname: ", hostname);
    console.log("pathname: ", pathname);

    switch (process.env.NODE_ENV) {
      case "development":
        console.log("Хөгжүүлэлтийн орчинд ажиллаж байна");
        hostObject = prepareDevelopmentHost(hostname, pathname);
        // hostObject = prepareProductionHost(hostname, pathname);
        break;
      case "production":
        console.log("Production орчинд ажиллаж байна");
        hostObject = prepareProductionHost(hostname, pathname);
        break;
      default:
        break;
    }

    console.log("hostObject: ", hostObject);
  }

  // If localhost, assign the host value manually
  // If prod, get the custom domain/subdomain value by removing the root URL
  // (in the case of "test.vercel.app", "vercel.app" is the root URL)
  const currentHost =
    process.env.NODE_ENV == "production"
      ? hostname.replace(`.${process.env.ROOT_URL}`, "")
      : process.env.CURR_HOST;

  // Prevent security issues – users should not be able to canonically access
  // the pages/sites folder and its respective contents. This can also be done
  // via rewrites to a custom 404 page
  if (url.pathname.startsWith(`/_sites`)) {
    return new Response(null, { status: 404 });
  }

  if (
    !url.pathname.includes(".") && // exclude all files in the public folder
    !url.pathname.startsWith("/api") // exclude all API routes
  ) {
    // rewrite to the current hostname under the pages/sites folder
    // the main logic component will happen in pages/sites/[site]/index.tsx
    url.pathname = `/_sites/${currentHost}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
}
