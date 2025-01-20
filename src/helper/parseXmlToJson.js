import { Parser } from "xml2js";

// Method use to parse XML to JSON
export const parseXmlToJson = (xml) => {
  return new Promise((resolve, reject) => {
    const xmlParser = new Parser();
    xmlParser.parseString(xml, (err, result) => {
      if (err) {
        reject(new Error("Failed to parse XML"));
      } else {
        resolve(result);
      }
    });
  });
};