var parentListId = "playthrough_list";
var parentList = document.querySelector("#" + parentListId);
var data = [];
var currentDataObject = null;
for (var i = 0; i < parentList.children.length; i++) {
  var child = parentList.children[i];

  var isTitle = i % 2 === 0;

  if (isTitle){
    currentDataObject = {};
    var inProgressText = child.querySelector(".in_progress").innerText;
    var areaName = child.innerText.replace(" " + inProgressText, "");
    currentDataObject.areaName = areaName;
  }
  else{
    var listItems = [];
    child.querySelectorAll(".checkbox .item_content").forEach(function(itemContent){
      listItems.push({ text: itemContent.innerText });
    });

    currentDataObject.listItems = listItems;

    data.push(currentDataObject);
  }

};

console.log(JSON.stringify(data));