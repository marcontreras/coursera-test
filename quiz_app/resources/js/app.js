var app = angular.module('quiz',["angular-bind-html-compile"]);

app.run(function( $rootScope )
{
  $rootScope.current_template = 'resources/html/quiz.html';
  $rootScope.number_correct_answers=0;
  $rootScope.number_questions=0;
  $rootScope.quiz = {};
});
