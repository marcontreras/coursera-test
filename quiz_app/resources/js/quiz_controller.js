app.controller('QuizController',function($scope, $rootScope, $http, $sce, $window, $timeout){

  $scope.hide_pbefore = true;
  $scope.hide_pafter = false;
  $scope.hide_maxpbefore = true;
  $scope.hide_maxpafter = true;
  $scope.visualizer = {
    'state': false,
    'style': {}
  };
  $scope.app_error = {'state': false, 'message': ""};
  $scope.current_question = {};

  var status_evaluated = false;

  /**********************************GET QUIZ XML FILE*****************************************************/
  /*
  $http({

    method: 'GET',
    url: 'resources/xml/quiz.xml'

  }).success(function(data, status, headers, config){
    var x2js = new X2JS();
    LoadQuiz(x2js.xml_str2json(data));
  }).error(function(data, status, headers, config){
    alert("Ha fallado la petición, no se ha podido leer el archivo de configuración. Estado HTTP:"+status);
  });
*/
  /**********************************GET QUIZ JSON FILE*****************************************************/

  $http({

    method: 'GET',
    url: 'resources/json/quiz.json'

  }).success(function(data, status, headers, config){
    LoadQuiz(data);
  }).error(function(data, status, headers, config){
    alert("Ha fallado la petición, no se ha podido leer el archivo de configuración. Estado HTTP:"+status);
  });

  /**********************************LOAD QUIZ*****************************************************/
  function LoadQuiz(data)
  {
    if(data.quiz.questions.question.length > 0)
    {
      if(data.quiz.questions_to_show > 0)
      {
        if(data.quiz.questions_to_show <= data.quiz.questions.question.length)
        {
          $rootScope.number_questions = data.quiz.questions_to_show;
          $rootScope.quiz.title = data.quiz.title;
          $rootScope.quiz.question=[];
          var quiz_database;

          if(1 == data.quiz.random_mode)
          {
            quiz_database = Shuffle(data.quiz.questions.question);
            var n = $rootScope.number_questions;

            while(n)
            {
              i = Math.floor(Math.random() * quiz_database.length);

              if (i in quiz_database)
              {
                $rootScope.quiz.question.push(quiz_database[i]);
                delete quiz_database[i];
                n--;
              }
            }
          }
          else
          {
            quiz_database=[];
            for(i=0; i<$rootScope.number_questions; i++)
            {
              quiz_database[i] = data.quiz.questions.question[i];
              $rootScope.quiz.question = Shuffle(quiz_database);
            }
          }
        }
        else
        {
          $scope.app_error.state=true;
          $scope.app_error.message="Error de configuración: El número de preguntas a mostrar es mayor que el número de preguntas disponibles en la base de datos";
        }
      }
      else
      {
        $scope.app_error.state=true;
        $scope.app_error.message="Error de configuración: El número de preguntas a mostrar es menor o igual a cero";
      }
    }
    else
    {
      $scope.app_error.state=true;
      $scope.app_error.message="Error de configuración: No se encontraron preguntas en la base de datos";
    }


    for(i=0; i<$rootScope.number_questions; i++)
    {

      $rootScope.quiz.question[i].options.option = Shuffle($rootScope.quiz.question[i].options.option);

      $rootScope.quiz.question[i].html_text_test="<b>"+(i+1)+". "+$rootScope.quiz.question[i].text+"</b>";

      $rootScope.quiz.question[i].is_correct_answer=false;

      switch ($rootScope.quiz.question[i].type){

        case "DropDownList":
        $rootScope.quiz.question[i].html_text_result=$sce.trustAsHtml($rootScope.quiz.question[i].text.replace("_","________"));

        $rootScope.quiz.question[i].selected_answer = "";

        $rootScope.quiz.question[i].html_text_test=$sce.trustAsHtml($rootScope.quiz.question[i].html_text_test.replace("_",
        "<select ng-model=\"quiz.question["+i+"].selected_answer\">"+
        "<option value=\"\">__________</option>"+
        "<option ng-repeat=\"opt in quiz.question["+i+"].options.option\" value=\"{{opt}}\">{{opt}}</option>"+
        "</select>"));

        $rootScope.quiz.question[i].html_text_options=$sce.trustAsHtml('');

        break;

        case "RadioButton":
        $rootScope.quiz.question[i].html_text_result = $sce.trustAsHtml($rootScope.quiz.question[i].text);

        $rootScope.quiz.question[i].selected_answer = "";

        $rootScope.quiz.question[i].html_text_options=$sce.trustAsHtml(
          "<div class=\"lv_wrapper_options\">"+
          "<div ng-repeat=\"opt"+i+" in quiz.question["+i+"].options.option\" class=\"col-xs-12 col-sm-6 col-md-6\">"+
          "<label class=\"col-xs-12 lv_answer_option input-group\">"+
          "<span class=\"input-group-addon lv_addon\" ng-class=\"{lv_addon_active: quiz.question["+i+"].selected_answer == '{{opt"+i+"}}'}\">"+
          "<input type=\"radio\" autocomplete=\"off\" name=\"optradio_"+i+"\" ng-model=\"quiz.question["+i+"].selected_answer\" value=\"{{opt"+i+"}}\"/>"+
          "</span>"+
          "{{opt"+i+"}}"+
          "</label>"+
          "</div>"+
          "</div>"
        );

        break;

        case "ImageRadioButton":
        $rootScope.quiz.question[i].html_text_result = $sce.trustAsHtml($rootScope.quiz.question[i].text);

        $rootScope.quiz.question[i].selected_answer = "";

        $rootScope.quiz.question[i].html_text_options=$sce.trustAsHtml(
          "<div class=\"lv_wrapper_options\">"+
          "<div ng-repeat=\"opt"+i+" in quiz.question["+i+"].options.option\" class=\"col-xs-6 col-sm-3 col-md-3 lv_wrapper_optimage\">"+
          "<label style=\"padding-bottom:0px !important; margin:0px !important;\" class=\"col-xs-12 lv_answer_option input-group\">"+

          "<input id=\"optradio_"+i+"{{$index}}\" class=\"imgoptchk\" type=\"radio\" autocomplete=\"off\" name=\"optradio_"+i+"\" ng-model=\"quiz.question["+i+"].selected_answer\" value=\"{{opt"+i+".src}}\"/>"+

          "<label class=\"imgchk\" for=\"optradio_"+i+"{{$index}}\">"+

          "<img id=\"img_"+i+"{{$index}}\" style=\"cursor:pointer;\" ng-src=\"{{opt"+i+".src}}\" class=\"img-responsive\" alt=\"\" ng-mouseover=\"ZoomVisualizer(true);\" ng-mouseleave=\"ZoomVisualizer(false);\" ng-mousemove=\"ZoomMovement('img_"+i+"',$index,opt"+i+".src,$event);\">"+

          "</label>"+
          "</label>"+
          "</div>"+
          "</div>"
        );

        break;

        case "CheckBox":
        $rootScope.quiz.question[i].html_text_result = $sce.trustAsHtml($rootScope.quiz.question[i].text);

        for(k=0; k<$rootScope.quiz.question[i].options.option.length; k++)
        {
          $rootScope.quiz.question[i].options.option[k].selected=0;
        }

        $rootScope.quiz.question[i].html_text_options=$sce.trustAsHtml(
          "<div class=\"lv_wrapper_options\">"+
          "<div ng-repeat=\"(index_chk"+i+", chk"+i+") in quiz.question["+i+"].options.option\" class=\"col-xs-12 col-sm-6 col-md-6\">"+
          "<label class=\"col-xs-12 lv_answer_option input-group\">"+
          "<span class=\"input-group-addon lv_addon\" ng-class=\"{lv_addon_active: 1==quiz.question["+i+"].options.option[index_chk"+i+"].selected}\">"+
          "<input type=\"checkbox\" autocomplete=\"off\" name=\"optchk_"+i+"\"  ng-model=\"quiz.question["+i+"].options.option[index_chk"+i+"].selected\" ng-true-value=1 ng-false-value=0>"+
          "</span>"+
          "{{chk"+i+".text}}"+
          "<label\">"+
          "</div>"+
          "</div>"
        );

        break;

        case "ImageCheckBox":
        $rootScope.quiz.question[i].html_text_result = $sce.trustAsHtml($rootScope.quiz.question[i].text);

        for(k=0; k<$rootScope.quiz.question[i].options.option.length; k++)
        {
          $rootScope.quiz.question[i].options.option[k].selected=0;
        }

        $rootScope.quiz.question[i].html_text_options=$sce.trustAsHtml(
          "<div class=\"lv_wrapper_options\">"+
          "<div ng-repeat=\"(index_chk"+i+", chk"+i+") in quiz.question["+i+"].options.option\" class=\"col-xs-6 col-sm-3 col-md-3 lv_wrapper_optimage\">"+
          "<label style=\"padding-bottom:0px !important; margin:0px !important;\" class=\"col-xs-12 lv_answer_option input-group\">"+

          "<input class=\"imgoptchk\" type=\"checkbox\" autocomplete=\"off\" id=\"imgoptchk_"+i+"{{index_chk"+i+"}}\"  ng-model=\"quiz.question["+i+"].options.option[index_chk"+i+"].selected\" ng-true-value=1 ng-false-value=0>"+

          "<label class=\"imgchk\" for=\"imgoptchk_"+i+"{{index_chk"+i+"}}\">"+

          "<img id=\"img_"+i+"{{index_chk"+i+"}}\" style=\"cursor:pointer;\" ng-src=\"{{chk"+i+".src}}\" class=\"img-responsive\" alt=\"\" ng-mouseover=\"ZoomVisualizer(true);\" ng-mouseleave=\"ZoomVisualizer(false);\" ng-mousemove=\"ZoomMovement('img_"+i+"',index_chk"+i+",chk"+i+".src,$event);\">"+

          "<label\">"+

          "<label\">"+

          "</div>"+
          "</div>"
        );

        break;

        default:
        break;
      }


      $scope.current_question.number = 0;
      $scope.current_question.instruction = $rootScope.quiz.question[0].instruction;
      $scope.current_question.text = $rootScope.quiz.question[0].html_text_test;
      $scope.current_question.options = $rootScope.quiz.question[0].html_text_options;

    }
  }

  /***********************************ZOOM VISUALIZER********************************************************/
  $scope.ZoomVisualizer = function(current_state)
  {
    $scope.visualizer.state = current_state;
  };

  /***********************************ZOOM MOVEMENT********************************************************/
  $scope.ZoomMovement = function(q_id,img_id,src,event)
  {
    var resource_id = '#'+q_id+img_id;

    var hwidth_container =$('#lv_zoom_visualizer').width()/2.0;
    var hheight_container =$('#lv_zoom_visualizer').height()/2.0;

    var width_img = $(resource_id).width();
    var height_img = $(resource_id).height();
    var nwidth_img = $(resource_id).get(0).naturalWidth;
    var nheight_img = $(resource_id).get(0).naturalHeight;

    var posx = hwidth_container-event.offsetX*nwidth_img/width_img;
    var posy = hheight_container-event.offsetY*nheight_img/height_img;

    $scope.visualizer.style={
      'background-image': "url('"+src+"')",
      'background-repeat': 'no-repeat',
      'background-attachment': 'scroll',
      'background-position': posx+'px '+posy+'px'};
    };

    /***********************************SHUFFLE FUNCTION*******************************************************/
    function Shuffle(array)
    {
      var m = array.length, t, i;

      while(m)
      {
        i = Math.floor(Math.random() * m--);

        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      return array;
    }


    /**********************************CHANGE CURRENT QUESTION*****************************************************/
    $scope.ChangeCurrentQuestion = function(question_number)
    {

      $scope.hide_pbefore = false;
      $scope.hide_pafter = false;
      var pmin=0;

      if(question_number < 1)
      {
        $scope.hide_pbefore=true;
      }

      if(question_number > $rootScope.number_questions-2)
      {
        $scope.hide_pafter=true;
      }

      if(0<=question_number && $rootScope.number_questions>question_number)
      {
        $scope.current_question.number = question_number;
        $scope.current_question.instruction = $rootScope.quiz.question[question_number].instruction;
        $scope.current_question.text = $rootScope.quiz.question[question_number].html_text_test;
        $scope.current_question.options = $rootScope.quiz.question[question_number].html_text_options;

        $('.link_pages').removeClass('active');
        $('#page_'+question_number).addClass('active');


        if($rootScope.number_questions>10)
        {
          $('.link_pages').removeClass('lv_pag_elements');

          if( question_number < 4)
          {
            pmin=0;
            $scope.hide_maxpbefore = true;
            $scope.hide_maxpafter = false;
          }
          else
          {
            $scope.hide_maxpbefore = false;

            if ( question_number > $rootScope.number_questions-5 )
            {
              pmin=$rootScope.number_questions-7;
              $scope.hide_maxpafter = true;
            }
            else
            {
              pmin=question_number-3;
              pmax=question_number+4;
              $scope.hide_maxpafter = false;
            }

          }

          for(p = pmin; p < pmin+7; p++)
          {
            $('#page_'+p).addClass('lv_pag_elements');
          }

        }

        if(true===status_evaluated)
        {
          $('#instruction').removeClass('lv_empty_answer');

          var empty_answers = CheckAnswers();

          for(e=0;e<empty_answers.length;e++)
          {
            if(question_number===empty_answers[e])
            {
              $('#instruction').addClass('lv_empty_answer');
              break;
            }
          }
        }

        $(window).scrollTop($(".lv_title_quiz").offset().top);
      }
    };


    /**********************************SUBMIT ANSWERS FOR QUESTIONS*****************************************************/
    $scope.SubmitAnswers = function()
    {
      status_evaluated = true;

      var empty_answers = CheckAnswers();

      if(empty_answers.length>0)
      {
        $scope.ChangeCurrentQuestion(empty_answers[0]);
      }
      else
      {
        $rootScope.current_template = 'resources/html/quiz_results.html';
      }
    };

    /**********************************CHECK ANSWERS FOR QUESTIONS*****************************************************/
    var CheckAnswers = function()
    {
      $('.link_pages').removeClass('lv_empty');

      var answer_state=false;
      var empty_answers = [];

      for(q=0; q<$rootScope.number_questions; q++)
      {

        if("CheckBox"==$rootScope.quiz.question[q].type || "ImageCheckBox"==$rootScope.quiz.question[q].type)
        {
          answer_state = false;
          for(k=0; k<$rootScope.quiz.question[q].options.option.length; k++)
          {
            answer_state=answer_state || (1 == $rootScope.quiz.question[q].options.option[k].selected);
            if(true === answer_state)
            {
              break;
            }
          }
        }
        else
        {
          if($rootScope.quiz.question[q].selected_answer.length > 0)
          {
            answer_state=true;
          }
          else{
            answer_state=false;
          }
        }

        if(false === answer_state)
        {
          empty_answers.push(q);
          $('#page_'+q).addClass('lv_empty');
        }

      }

      return empty_answers;

    };



    var waitForRenderTeam = function()
    {
      if($http.pendingRequests.length > 0)
      {
        $timeout(waitForRenderTeam); // Wait for all templates to be loaded
      }
      else
      {
        if($rootScope.number_questions>10)
        {
          $scope.hide_maxpafter = false;
          $('#page_7').removeClass('lv_pag_elements');
          $('#page_8').removeClass('lv_pag_elements');
          $('#page_9').removeClass('lv_pag_elements');
        }
      }
    };

    $timeout(waitForRenderTeam);

  });
