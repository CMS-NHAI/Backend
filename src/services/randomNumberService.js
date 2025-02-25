export const generateFiveDigitRandomNumber = ()=> {
     const fiveDigitNumber = Math.floor(Math.random() * 90000) + 10000;
     return fiveDigitNumber
}