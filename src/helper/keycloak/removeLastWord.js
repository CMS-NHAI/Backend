export const removeLastWord = (str) => {
    const words = str.split(' ');
    words.pop();  
    return words.join(' '); 
  };