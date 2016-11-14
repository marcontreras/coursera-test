app.controller('QuizResultsController',function($scope, $rootScope, $http, $sce){

  $scope.title_accordion = "VER RESULTADO DE CADA PREGUNTA";

  /*******************************************EVALUATION ANSWERS*****************************************************/
  function EvaluationAnswers()
  {
    $rootScope.number_correct_answers=0;

    for(q=0; q<$rootScope.number_questions; q++)
    {

      if("CheckBox"==$rootScope.quiz.question[q].type || "ImageCheckBox"==$rootScope.quiz.question[q].type)
      {
        var correct=0;

        for(k=0; k<$rootScope.quiz.question[q].options.option.length; k++)
        {
          if($rootScope.quiz.question[q].options.option[k].selected==$rootScope.quiz.question[q].options.option[k].truth)
          {
            correct = correct+1;
          }
        }

        if(correct == $rootScope.quiz.question[q].options.option.length)
        {
          $rootScope.number_correct_answers = $rootScope.number_correct_answers + 1;
          $rootScope.quiz.question[q].is_correct_answer = true;
        }

        if("CheckBox"==$rootScope.quiz.question[q].type)
        {
          $rootScope.quiz.question[q].html_text_options_result = $sce.trustAsHtml(
            "<ul>"+
            "<li ng-repeat=\"optr"+q+" in quiz.question["+q+"].options.option | filter:{selected: 1}\">"+
            "{{optr"+q+".text}}"+
            "</li>"+
            "</ul>"
          );
        }
        else
        {
          $rootScope.quiz.question[q].html_text_options_result = $sce.trustAsHtml(
            "<div id=\"lv_carousel"+q+"\" class=\"carousel slide\" data-ride=\"carousel\" style=\"max-width:160px; margin:auto;\">"+
              "<ol class=\"carousel-indicators\">"+
                "<li data-target=\"#lv_carousel"+q+"\" data-slide-to=\"{{$index}}\" ng-repeat=\"optr"+q+" in quiz.question["+q+"].options.option | filter:{selected: 1}\" ng-class=\"{active: 0==$index}\"></li>"+
              "</ol>"+

              "<div class=\"carousel-inner\" role=\"listbox\">"+
                "<div class=\"item\"  ng-class=\"{active: 0==$index}\" ng-repeat=\"optr_"+q+" in quiz.question["+q+"].options.option | filter:{selected: 1}\">"+
                  "<img ng-src=\"{{optr_"+q+".src}}\" alt=\"\" class=\"img-responsive\">"+
                "</div>"+
              "</div>"+

              "<a class=\"left carousel-control\" data-target=\"#lv_carousel"+q+"\" role=\"button\" data-slide=\"prev\">"+
                "<span class=\"glyphicon glyphicon-chevron-left\" aria-hidden=\"true\"></span>"+
              "</a>"+
              "<a class=\"right carousel-control\" data-target=\"#lv_carousel"+q+"\" role=\"button\" data-slide=\"next\">"+
                "<span class=\"glyphicon glyphicon-chevron-right\" aria-hidden=\"true\"></span>"+
              "</a>"+
            "</div>"
          );

        }

      }
      else
      {
        if($rootScope.quiz.question[q].selected_answer==$rootScope.quiz.question[q].correct_answer)
        {
          $rootScope.number_correct_answers = $rootScope.number_correct_answers + 1;
          $rootScope.quiz.question[q].is_correct_answer = true;
        }

        if("ImageRadioButton"==$rootScope.quiz.question[q].type)
        {
          $rootScope.quiz.question[q].html_text_options_result = $sce.trustAsHtml(
            "<img style=\"max-width:160px; margin:auto;\" ng-src=\"{{quiz.question["+q+"].selected_answer}}\" alt=\"\" class=\"img-responsive\">"
          );
        }
        else
        {
          $rootScope.quiz.question[q].html_text_options_result = $sce.trustAsHtml("<ul><li>"+$rootScope.quiz.question[q].selected_answer+"</li></ul>");
        }
      }
    }
  }

  /**********************************TRY AGAIN*****************************************************/
  $scope.TryAgain=function()
  {
    $rootScope.current_template = 'resources/html/quiz.html';
  };

  $('#lv_collapse_results').on('shown.bs.collapse', function () {
    $("#lv_table_wrap").scrollTop(0);
    $scope.title_accordion = "OCULTAR RESULTADO DE CADA PREGUNTA";
    $scope.$apply();
  });

  $('#lv_collapse_results').on('hidden.bs.collapse', function () {
    $scope.title_accordion = "VER RESULTADO DE CADA PREGUNTA";
    $scope.$apply();
  });

  EvaluationAnswers();

});
