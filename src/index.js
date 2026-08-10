
const fetchData = async () => {

  try {
    const response = await fetch("https://books.toscrape.com/");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = response.json();
    console.log(data);

  } catch (error) {
   console.error('Fetching data error: ', error);
  }

}

fetchData();
