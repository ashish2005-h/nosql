const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('navbar-links')[0]

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active')
})

function loadData(records = []) {
	var table_data = "";
	for (let i = 0; i < records.length; i++) {
		table_data += `<tr>`;
		table_data += `<td>${records[i].name}</td>`;
		table_data += `<td>${records[i].modelno}</td>`;
		table_data += `<td>${records[i].brand}</td>`;
		table_data += `<td>${records[i].description}</td>`;
		table_data += `<td>${records[i].features}</td>`;
		table_data += `<td>${records[i].image}</td>`;
		table_data += `<td>${records[i].Quantity}</td>`;
    table_data += `<td>${records[i].price}</td>`;
		table_data += `<td>`;
		table_data += `<a href="/add"?id=${records[i]._id}"><button class="btn"><i class="fa fa-edit" ></i></button></a>`;
		table_data += '&nbsp;&nbsp;';
		table_data += `<button class="btn" onclick=deleteData('${records[i]._id}')><i class="fa fa-trash" ></i></button>`;
		table_data += `</td>`;
		table_data += `</tr>`;
	}
	//console.log(table_data);
	document.getElementById("tbody").innerHTML = table_data;
}

function getData() {
	fetch("https://localhost:3000/product")
		.then((response) => response.json())
		.then((data) => {
			console.table(data);
			loadData(data);
		});
}