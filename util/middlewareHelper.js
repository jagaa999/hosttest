export const prepareHostObject = (url, hostname, pathname) => {
  let hostObject = {
    domain: { subDomain: "", rootDomain: "", tld: "" },
    slug: "",
    domainType: "default", //default, local, sub
  };

  if (
    !url.pathname.includes(".") && // exclude files public folder
    !url.pathname.startsWith("/api") && // exclude API routes
    !url.pathname.startsWith("/page") // page-ийг бас орхих хэрэгтэй.
  ) {
    console.log("\n\n---------------------- \n");
    console.log("hostname: ", hostname);
    console.log("pathname: ", pathname);

    switch (process.env.NODE_ENV) {
      case "development":
        // console.log("Хөгжүүлэлтийн орчинд ажиллаж байна");
        hostObject = prepareDomainDevelopmentHost(hostname, pathname);
        // hostObject = prepareProductionHost(hostname, pathname);
        break;
      case "production":
        // console.log("Production орчинд ажиллаж байна");
        hostObject = prepareDomainProductionHost(hostname, pathname);
        break;
      default:
        break;
    }
  }

  //correct and convert domains
  if (hostObject.domain.rootDomain === "skyresorteshop")
    hostObject.domain.rootDomain = "skyresort";
  if (
    hostObject.domain.rootDomain === undefined ||
    hostObject.domain.rootDomain === ""
  ) {
    hostObject.domain.rootDomain = "citizen";
  }

  return hostObject;
};

export const prepareDomainDevelopmentHost = (hostname, pathname) => {
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
    domainType: "local",
  };
};

export const prepareDomainProductionHost = (hostname, pathname) => {
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

  let domainType = "default";

  let hostObject = {
    domain: { subDomain: "", rootDomain: "", tld: "" },
    slug: "",
    domainType,
  };

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
        domainType,
      };
      break;
    case "local":
      hostObject = prepareDomainDevelopmentHost(
        `${subDomain}.${rootDomain}.${tld}`,
        pathname
      );
      break;
    case "sub":
      hostObject = {
        domain: { subDomain: "www", rootDomain: subDomain, tld: tld },
        slug: tempSlug,
        domainType,
      };
      break;
    default:
      break;
  }

  return hostObject;
};
