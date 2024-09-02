const maxNumDaveners = 20;
var numDaveners = 0;
var submitAttempted = false;
var language = 'en';

const membershipFull = 800;
const membershipPartial = 1100;
const buildingFund = 3600;
const weekdayDavener = 600;
const seatOne = 100;
const seatTwo = 150;

var membershipDue = 0;
var buildingFundDue = 0;
var seatsDue = 0;
var seatSummary = []


function stashEnglish() {
    localizations["en"] = [];
    for (const [key, value] of Object.entries(localizations["he"])) {
        localizations["en"][key] = $('#' + key).html()
    }
    localizations["en"]['name'] = "Name"
}

function localizeHebrew() {
    $("html").children().css("direction","rtl");

    $('#logo').css('padding-right', '0em');
    $('#logo').css('padding-left', '1em');
    $('#logo').css('float', 'right');

    $('#locale').css('float', 'left');

    $('.davenerWidget').css('margin-right', '0em');
    $('.davenerWidget').css('margin-left', '1em');

    localize("he");
}

function localizeEnglish() {
    $("html").children().css("direction","ltr");

    $('#logo').css('padding-right', '1em');
    $('#logo').css('padding-left', '0em');
    $('#logo').css('float', 'left');

    $('#locale').css('float', 'right');

    $('.davenerWidget').css('margin-right', '1em');
    $('.davenerWidget').css('margin-left', '0em');

    localize("en");
}

function localize(locale) {
    language = locale;

    for (const [key, value] of Object.entries(localizations[locale])) {
        $('#' + key).html(value)
    }

    const daveners = $("#daveners");
    daveners.find('span[id="davenerTitleStart"]').html(localizations[locale]['davenerTitleStart'])
    daveners.find('input[class="name davenerWidget"]').attr('placeholder', localizations[locale]['name']);

    daveners.find('label[class="maleLabel"]').html(localizations[locale]['maleLabelX']);
    daveners.find('label[class="femaleLabel"]').html(localizations[locale]['femaleLabelX']);

    daveners.find('option[id="optionType"]').html(localizations[locale]['optionType']);
    daveners.find('option[id="optionMember"]').html(localizations[locale]['optionMember']);
    daveners.find('option[id="optionYoungKid"]').html(localizations[locale]['optionYoungKid']);
    daveners.find('option[id="optionOldKid"]').html(localizations[locale]['optionOldKid']);
    daveners.find('option[id="optionGuest"]').html(localizations[locale]['optionGuest']);

    daveners.find('option[id="optionGrade"]').html(localizations[locale]['optionGrade']);
    daveners.find('option[id="optionGan"]').html(localizations[locale]['optionGan']);
    daveners.find('option[id="optionFirst"]').html(localizations[locale]['optionFirst']);
    daveners.find('option[id="optionSecond"]').html(localizations[locale]['optionSecond']);
    daveners.find('option[id="optionThird"]').html(localizations[locale]['optionThird']);
    daveners.find('option[id="optionFourth"]').html(localizations[locale]['optionFourth']);

    daveners.find('label[class="roshHaShanahLabel"]').html(localizations[locale]['roshHaShanahLabelX']);
    daveners.find('label[class="yomKippurLabel"]').html(localizations[locale]['yomKippurLabelX']);
}

function submit() {
    var data = {};
    data['name'] = $('#name').first().val();
    data['email'] = $('#email').first().val();
    data['year'] = 2024;

    data['membership'] = $('#membership').val()

    seatSummary["roshHaShanah"] = []
    seatSummary["yomKippur"] = []
    seatSummary["roshHaShanah"]["men"] = 0
    seatSummary["roshHaShanah"]["women"] = 0
    seatSummary["yomKippur"]["men"] = 0
    seatSummary["yomKippur"]["women"] = 0

    var daveners = [numDaveners];
    for (i = 0; i < numDaveners; i++) {
        daveners[i] = getDavener(i);
    }
    data['daveners'] = daveners;

    data["summary"] = {"roshHaShanah" : {'men' : seatSummary["roshHaShanah"]["men"], 'women' : seatSummary["roshHaShanah"]["women"]},
                       "yomKippur" : {'men' : seatSummary["yomKippur"]["men"], 'women' : seatSummary["yomKippur"]["women"]}};

    data["seatsElsewhere"] = {"seatsElsewhere" : $('#elsewhereButtonYes').prop("checked")}
    if ($('#elsewhereButtonYes').prop("checked")) {
        data["seatsElsewhere"]["explanation"] = $('#elsewhereExplanation').first().val();
    }

    data['notes'] = $('#notes').val();

    data['membershipDue'] = membershipDue;
    data['buildingFundDue'] = buildingFundDue;
    data['seatsDue'] = seatsDue;
    data['totalDue'] = membershipDue + buildingFundDue + seatsDue;

    // TODO - host
    post("https://api.ktefrat.org.il/entities/yamimNoraimSeats", data, onSuccess, onError);
}

function getDavener(number) {
    var davener = {};

    davener['name'] = $('input[name="name' + number + '"]').first().val();

    var male = $('#maleButton' + number).prop("checked");
    davener['gender'] = male ? "male" : "female";

    davener['type'] = $('select[name="type' + number + '"]').first().val();
    if (davener['type'] == 'youngKid') {
        davener['grade'] = $('select[name="grade' + number + '"]').val();
    }
    davener['days'] = {}

    const roshHaShanah = $('#roshHaShanah' + number);
    const yomKippur = $('#yomKippur' + number);
    if (roshHaShanah.prop("checked")) {
        seatSummary["roshHaShanah"][male ? "men" : "women"] = seatSummary["roshHaShanah"][male ? "men" : "women"] + 1
        davener['days']['roshHaShanah'] = true;
    } else {
        davener['days']['roshHaShanah'] = false;
    }

    if (yomKippur.prop("checked")) {
        seatSummary["yomKippur"][male ? "men" : "women"] = seatSummary["yomKippur"][male ? "men" : "women"] + 1
        davener['days']['yomKippur'] = true;
    } else {
        davener['days']['yomKippur'] = false;
    }

    return davener;
}

var onSuccess = function(response) {
    console.log(response);
    window.location.replace("thanks.html?language=" + language + "&membershipDue=" + membershipDue + "&buildingFundDue=" + buildingFundDue + "&seatsDue=" + seatsDue + "&email=" + $('#email').first().val().trim());
};

var onError = function(err) {
    alert("Error submitting form");
    $("#submitButton"). attr("disabled", false);
    console.error(err);
};

var onLinkError = function(err) {
    alert("Error generating link");
    console.error(err);
};

function post(endpointUrl, data, onSuccess, onError) {
    $("#submitButton"). attr("disabled", true);
    $.ajax({
        type: "POST",
        url: endpointUrl,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: onSuccess,
        error: function(xhr, status) {
            if (typeof this.statusCode[xhr.status] !== 'undefined') {
                return false;
            }

            onError(err);
        },
        statusCode: {
            // Endpoint thinks that it's likely a spam/bot request, you need to change "spam protection mode" to "never" in HeroTofu forms
            422: function(response) {
            alert("Cannot send request, are you robot?");
            },
        }
    });
}

function generateLink(amount, description, email, onLinkSuccess, onLinkError) {
    $.ajax({
        type: "GET",
        // TODO - HOST
        url: "https://api.ktefrat.org.il/paymentLink?amount=" + amount + "&description=" + description + "&language=" + language + "&email=" + email,
        contentType: "application/json; charset=utf-8",
        success: onLinkSuccess,
        error: function(xhr, status) {
            if (typeof this.statusCode[xhr.status] !== 'undefined') {
                return false;
            }

            onLinkError(err);
        }
    });
}

function updateDaveners(newValue) {
    const oldNumDaveners = parseInt(numDaveners);
    const newNumDaveners = parseInt(newValue);
    numDaveners = newNumDaveners;
    
    if (newNumDaveners > oldNumDaveners) {
        for (i = oldNumDaveners; i < newNumDaveners; i++) {
            const davenerX = $('#davenerX').clone();
            adjustIdsAndNames(davenerX, i);
            davenerX.appendTo('#daveners');
        }
    } else if (newNumDaveners < oldNumDaveners) {
        for (i = oldNumDaveners - 1; i >= newNumDaveners; i--) {
            $('#davener' + i).remove();
        }
    }

    if (newNumDaveners > 0) {
        $('#summary').removeClass('gone');
        $('#elsewhereSection').removeClass('gone');
    } else {
        $('#summary').addClass('gone');
        $('#elsewhereSection').addClass('gone');
    }
}

function adjustIdsAndNames(davener, number) {
    davener.find('#davenerNumber').text(parseInt(number) + 1);

    $('#name').on('change', function() {
        validate();
    });

    $('#email').on('change', function() {
        validate();
    });

    $('#membership').on('change', function() {
        validate();
    });

    $('#numDaveners').on('change', function() {
        validate();
    });

    $('#elsewhereButtonNo').on('change', function() {
        validate();
    });

    $('#elsewhereButtonYes').on('change', function() {
        validate();
    });

    $('#elsewhereExplanation').on('change', function() {
        validate();
    });

    davener.find('input[name="nameX"]').on('change', function() {
        validate();
    });

    davener.find('#maleButtonX').on('change', function() {
        validate();
    });

    davener.find('#femaleButtonX').on('change', function() {
        validate();
    });

    davener.find('select[name="typeX"]').on('change', function() {
        validate();
    });

    davener.find('select[name="gradeX"]').on('change', function() {
        validate();
    });

    davener.find('#roshHaShanahX').on('change', function() {
        validate();
    });

    davener.find('#yomKippurX').on('change', function() {
        validate();
    });

    davener.attr('id', 'davener' + number);
    davener.find('input[name="nameX"]').attr('name', 'name' + number);
    davener.find('input[name="genderX"]').attr('name', 'gender' + number);
    davener.find('#maleLabelX').attr('for', 'maleButton' + number);
    davener.find('#femaleLabelX').attr('for', 'femaleButton' + number);
    davener.find('#maleButtonX').attr('id', 'maleButton' + number);
    davener.find('#maleLabelX').attr('id', 'maleLabel' + number);
    davener.find('#femaleButtonX').attr('id', 'femaleButton' + number);
    davener.find('#femaleLabelX').attr('id', 'femaleLabel' + number);
    davener.find('select[name="typeX"]').attr('name', 'type' + number);
    davener.find('select[name="gradeX"]').attr('name', 'grade' + number);
    davener.find('input[name="roshHaShanahX"]').attr('name', 'roshHaShanah' + number);
    davener.find('input[name="yomKippurX"]').attr('name', 'yomKippur' + number);
    davener.find('#roshHaShanahX').attr('id', 'roshHaShanah' + number);
    davener.find('#yomKippurX').attr('id', 'yomKippur' + number);
    davener.find('#roshHaShanahLabelX').attr('for', 'roshHaShanah' + number);
    davener.find('#yomKippurLabelX').attr('for', 'yomKippur' + number);
    davener.find('#roshHaShanahLabelX').attr('id', 'roshHaShanahLabel' + number);
    davener.find('#yomKippurLabelX').attr('id', 'yomKippurLabel' + number);
    davener.find('#dueX').attr('id', 'due' + number);
    davener.find('#dueAmountX').attr('id', 'dueAmount' + number);
}

function validate() {
    var valid = true;

    const nameInput0 = $('#name').first();
    if (!nameInput0.val().trim()) {
        valid = false;
        if (submitAttempted) {
            nameInput0.addClass('error');
        }
    } else {
        nameInput0.removeClass('error');
    }

    const emailInput = $('#email').first();
    if (!isEmail(emailInput.val().trim())) {
        valid = false;
        if (submitAttempted) {
            emailInput.addClass('error');
        }
    } else {
        emailInput.removeClass('error');
    }

    const membershipInput = $('#membership').first();
    if (membershipInput.val() == "-") {
        valid = false;
        if (submitAttempted) {
            membershipInput.addClass('error');
        }
    } else {
        membershipInput.removeClass('error');
    }

    var seatTotal = 0;

    for (i = 0; i < numDaveners; i++) {
        const davener = $('#davener' + i);

        const nameInput = davener.find('input[name="name' + i + '"]').first();
        if (!nameInput.val().trim()) {
            valid = false;
            if (submitAttempted) {
                nameInput.addClass('error');
            }
        } else {
            nameInput.removeClass('error');
        }

        const male = davener.find('#maleButton' + i);
        const female = davener.find('#femaleButton' + i);
        if (!male.prop("checked") && !female.prop("checked")) {
            valid = false;
            if (submitAttempted) {
                davener.find('#maleLabel' + i).addClass('error');
                davener.find('#femaleLabel' + i).addClass('error');
            }
        } else {
            davener.find('#maleLabel' + i).removeClass('error');
            davener.find('#femaleLabel' + i).removeClass('error');
        }

        const typeInput = davener.find('select[name="type' + i + '"]').first();
        if (typeInput.val() == "-") {
            valid = false;
            if (submitAttempted) {
                typeInput.addClass('error');
            }
        } else {
            typeInput.removeClass('error');
        }

        const gradeInput = davener.find('select[name="grade' + i + '"]');
        if (typeInput.val() == "youngKid") {
            gradeInput.removeClass('gone');                    
            if (gradeInput.val() == "-") {
                valid = false;
                if (submitAttempted) {
                    gradeInput.addClass('error');
                }
            } else {
                gradeInput.removeClass('error');
            }

        } else {
            gradeInput.addClass('gone');
        }

        const roshHaShanah = davener.find('#roshHaShanah' + i);
        const yomKippur = davener.find('#yomKippur' + i);
        if (!roshHaShanah.prop("checked") && !yomKippur.prop("checked")) {
            valid = false;
            if (submitAttempted) {
                davener.find('#roshHaShanahLabel' + i).addClass('error');
                davener.find('#yomKippurLabel' + i).addClass('error');
            }
        } else {
            davener.find('#roshHaShanahLabel' + i).removeClass('error');
            davener.find('#yomKippurLabel' + i).removeClass('error');
        }

        $('#due' + i).addClass('gone');
        if (typeInput.val() == "guest") {
            if (roshHaShanah.prop("checked") && yomKippur.prop("checked")) {
                seatTotal += seatTwo;
                $('#dueAmount' + i).html(seatTwo + "&#8362;");
                $('#due' + i).removeClass('gone');
            } else if (roshHaShanah.prop("checked") || yomKippur.prop("checked")) {
                seatTotal += seatOne;
                $('#dueAmount' + i).html(seatOne + "&#8362;");
                $('#due' + i).removeClass('gone');
            }
        }

    }

    if (!$('#elsewhereButtonNo').prop("checked") && !$('#elsewhereButtonYes').prop("checked")) {
        valid = false;
        if (submitAttempted) {
            $('#elsewhereLabelNo').addClass('error');
            $('#elsewhereLabelYes').addClass('error');
        }
    } else {
        $('#elsewhereLabelNo').removeClass('error');
        $('#elsewhereLabelYes').removeClass('error');
        if ($('#elsewhereButtonYes').prop("checked")) {
            $('#elsewhereExplanationSection').removeClass('gone');
            if (!$('#elsewhereExplanation').first().val().trim()) {
                valid = false;
                if (submitAttempted) {
                    $('#elsewhereExplanation').addClass('error');
                }
            } else {
                $('#elsewhereExplanation').removeClass('error');
            }
        } else {
            $('#elsewhereExplanationSection').addClass('gone');
        }
    }

    switch (membershipInput.val()) {
        case "fullMember":
        case "becomingFullMember":
            membershipDue = membershipFull;
            break;
        case "partialMember":
            membershipDue = membershipPartial;
            break;
        case "weekdayDavener":
            membershipDue = weekdayDavener;
            break;
        default:
            membershipDue = 0;
            break;
    }
    switch (membershipInput.val()) {
        case "becomingFullMember":
            buildingFundDue = buildingFund;
            break;
        default:
            buildingFundDue = 0;
            break;
    }
    seatsDue = seatTotal;

    $('#membershipDueLabel').attr('href', 'https://icom.yaad.net/p/?action=pay&Amount=&Coin=1&FixTash=False&Info=Annual%20Dues&J5=False&Masof=4501681128&MoreData=True&PageLang=ENG&Postpone=False&SendHesh=True&ShowEngTashText=False&Sign=True&Tash=1&UTF8=True&UTF8out=True&action=pay&email=&sendemail=True&tmp=11&signature=79d428c7d6aae39d8634ed3d0edd7b51a8a11698bb680315448667e057f6574c');
    $('#buildingFundDueLabel').attr('href', 'https://pay.hyp.co.il/cgi-bin/yaadpay/yaadpay3ds.pl?Amount=3600&Coin=1&FixTash=False&Info=Building%20Fund&Masof=4501681128&MoreData=True&PageLang=ENG&Postpone=False&SendHesh=True&ShowEngTashText=True&Tash=1&UTF8out=True&action=pay&freq=1&sendemail=True&tmp=11&signature=9a82bde4c243551ccdee8592b0379c75490991da45996eade5c68bfc2e6ac414');
    $('#seatsDueLabel').attr('href', 'https://icom.yaad.net/p/?action=pay&Amount=&Coin=1&FixTash=False&Info=Yamim%20Noraim%20Seats&J5=False&Masof=4501681128&MoreData=True&PageLang=ENG&Postpone=False&SendHesh=True&ShowEngTashText=False&Sign=True&Tash=1&UTF8=True&UTF8out=True&action=pay&email=&sendemail=True&tmp=11&signature=f75619bcb01c1d3d743f570cc194065084bbf54033978458be4c90625b703bdc');

    var email = $('#email').first().val().trim();

    if (membershipDue == 0) {
        $('#membershipDueLabel').removeAttr("href");
    } else {
        generateLink(membershipDue, language == "en" ? "Annual Dues" : "דמי חבר", email, function(response) {
           $('#membershipDueLabel').attr('href', response.link);
        }, onLinkError);
    }

    if (buildingFundDue == 0) {
        $('#buildingFundDueLabel').removeAttr("href");
    } else {
        generateLink(buildingFundDue, language == "en" ? "Building Fund" : "קרן בניין", email, function(response) {
           $('#buildingFundDueLabel').attr('href', response.link);
        }, onLinkError);
    }

    if (seatTotal == 0) {
        $('#seatsDueLabel').removeAttr("href");
    } else {
        generateLink(seatTotal, language == "en" ? "Seats for Yamim Noraim" : "מקומות לימים נוראים", email, function(response) {
           $('#seatsDueLabel').attr('href', response.link);
        }, onLinkError);
    }

    $('#membershipDue').text(membershipDue);
    $('#buildingFundDue').text(buildingFundDue);
    $('#seatsDue').text(seatTotal);

    if (submitAttempted) {
        $("#submitButton"). attr("disabled", !valid);
    }

    return valid;
}

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}
