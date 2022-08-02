$('#question-search').on('input', function() {
  var search = $(this).serialize();

  if(search === "search="){
    search = "all"
  }
  $.get('/questions?' + search, function(data) {
    $('#question-grid').html('');
    data.forEach(function(question){
      $('#question-grid').append(`
        <div class="col-md-3 col-sm-6">
          <div class="title">
                        <h5>`+question.title+`</h4>
                   <div class="subtopic">
                        <h5>`+ question.subtopic+`</h4>
                   </div>
                   <div class="difficulty">
                        <h5>`+ question.difficulty+`</h4>
                   </div>
                   <p>
                       <a href="/questions/`+ question._id+`" class="btn btn-primary">More Info</a>
                   </p>
            </div>
        </div>
      `);
    });
  });
});

$('#question-search').submit(function(event) {
  event.preventDefault();
});