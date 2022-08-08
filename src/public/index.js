const addToTable = (array) => {
  const body = document.getElementById("body");
  body.append(
    createElement("table", [
      createElement("thead",
        Object.keys(array[0]).map((item) =>
          createElement("th", item),
        )
      ),
      createElement(
        "tbody",
        array.map((item) =>
          createElement("tr",
            Object.keys(item).map((itm) => createElement("td", item[itm]))
          )
        )
      ),
    ])
  );
};

const createElement = (type, value = null) => {
  if (value) {
    let data = document.createElement(type);
    if (typeof value == "object") {
      for (let i = 0; i < value.length; i++) {
        const element = value[i];
        data.append(element);
      }
    } else {
      data.append(value);
    }
    return data;
  }
  return document.createElement(type);
};


const axios = async function (query = "", variables = {}) {
  try {
    let res = await fetch("http://localhost:3000/graphql", {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    res = await res.json();
    if (res.errors) {
      return { error: false, errorMessage: res.errors[0].message };
    } else {
      return { error: false, data: res.data[Object.keys(res.data)[0]] };
    }
  } catch (error) {
    return { error: true, errorMessage: error.message };
  }
};


const upload = async function (file) {
  const form = new FormData();
  form.append('file', file);

  try {
    let res = await fetch("http://localhost:3000/upload", {
      method: "post",
      body: form
    });
    res = await res.json();
    if (res.errors) {
      return { error: false, errorMessage: res.errors[0].message };
    } else {
      return { error: false, data: res.data };
    }
  } catch (error) {
    return { error: true, errorMessage: error.message };
  }
};