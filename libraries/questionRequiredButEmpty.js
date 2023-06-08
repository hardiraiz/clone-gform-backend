const questionRequiredButEmpty = async (form, answers) => {
    // menemukan field required tapi tidak diisi
    const found = form.questions.filter((question) => {
        if(question.required === true) {
            const answer = answers.find((answer) => answer.questionId == question.id);
            
            if(answer == undefined || answer.value == undefined || 
                answer.value == null || answer.value == ''){
                return true
            }
        }
    });

    // check if form required is exist
    return found.length > 0 ? true : false;
}

export default questionRequiredButEmpty;
