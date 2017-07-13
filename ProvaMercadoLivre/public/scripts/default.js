var preloaderCall = function () {
    $('<div />', {
        'class': 'ml-preloader-overlay',
        'html': $('<div />', {
            'class': 'ml-preloader-effect'
        })
    }).prependTo('body');
}

var preloaderFinish = function () {
    $('body').find('.ml-preloader-overlay').fadeOut('fast', function () {
        $(this).remove();
    });
}

var breadcrumbLoad = function (searchField) {
    if (searchField != '') {
        $.ajax({
            url: '/apiSearchItens',
            type: 'get',
            data: {
                search: encodeURI(searchField)
            },
            dataType: 'json',
            beforeSend: function () {
                $('.ml-content .breadcrumb').html($('<li />', {
                    'html': $('<a />', {
                        'href': '#',
                        'text': 'Carregando...'
                    })
                })).fadeIn('fast');
            }
        }).done(function (data) {
            if (data.results.length > 0) {
                $('.ml-content > .container > .breadcrumb').empty();
                if (data.filters.length > 0) {
                    var categories = data.filters[0].values[0].path_from_root;
                    $.each(categories, function (i, val) {
                        $('<li />', {
                            'html': $('<a />', {
                                'href': 'javascript:apiSearchItens("' + val.name + '");',
                                'class': (i == categories.length - 1 ? 'active' : ''),
                                'text': val.name
                            })
                        }).appendTo('.ml-content .breadcrumb');
                    });
                } else {
                    $('<li />', {
                        'html': $('<a />', {
                            'href': 'javascript:apiSearchItens("' + searchField + '");',
                            'class': 'active',
                            'text': searchField
                        })
                    }).appendTo('.ml-content > .container > .breadcrumb');
                }
            }
        }).fail(function (jqXHR, textStatus, data) {
            console.log(data);
            $('.ml-content .breadcrumb').html($('<li />', {
                'html': $('<a />', {
                    'href': '#',
                    'text': 'Ocorreu um problema na solicitação! Tente novamente mais tarde.'
                })
            })).fadeIn('fast');
            $('.ml-content .breadcrumb').fadeOut('fast');
        });
    }
}

var apiSearchItens = function (searchField) {
    if (searchField != '') {
        $.ajax({
            url: '/apiSearchItens',
            type: 'get',
            data: {
                search: encodeURI(searchField)
            },
            dataType: 'json',
            beforeSend: function () {
                preloaderCall();
            }
        }).done(function (data) {
            if (data.results.length > 0) {
                breadcrumbLoad(searchField);
                //Remove Itens
                $('.ml-content > .container > .jumbotron').empty();
                //Show Search Results
                $('<div />', { 'class': 'ml-item-list' }).appendTo('.ml-content > .container > .jumbotron');
                $.each(data.results, function (i, val) {
                    $('<dl />', {
                        'id': val.id,
                        'data-id': val.id,
                        'html': [
                            $('<dt />', {
                                'class': 'ml-item-thumb',
                                'html': $('<img />', {
                                    'class': 'ml-item-thumb-low',
                                    'src': val.thumbnail,
                                    'alt': val.title
                                })
                            }),
                            $('<dd />', {
                                'class': 'ml-item-price',
                                'html': $('<input />', {
                                    'type': 'text',
                                    'value': val.price.toFixed(2),
                                    'readonly': true
                                }).priceFormat({
                                    prefix: 'R$ ',
                                    centsSeparator: ',',
                                    thousandsSeparator: '.',
                                    centsLimit: 2
                                })
                            }),
                            $('<dd />', {
                                'class': 'ml-item-description',
                                'text': val.title
                            }),
                            $('<dd />', {
                                'class': 'ml-item-address',
                                'text': val.address.city_name
                            })
                        ]
                    }).appendTo('.ml-content > .container > .jumbotron > .ml-item-list');

                    //Load Image High Quality
                    $.ajax({
                        url: '/apiItemAttributes',
                        type: 'get',
                        data: {
                            id: encodeURI(val.id)
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            preloaderCall();
                        }
                    }).done(function (data) {
                        $('#' + val.id + ' .ml-item-thumb').append($('<img />', {
                            'src': data.pictures[0].url,
                            'alt': data.title
                        }).on('load', function () {
                            $(this).hide().fadeIn('slow', function () {
                                $('#' + val.id + ' .ml-item-thumb .ml-item-thumb-low').fadeOut('fast', function () {
                                    $(this).remove();
                                });
                            });
                        }));
                    });

                })
            } else {
                $('<span />', {
                    'html': 'Nenhum Registro Encontrado'
                }).appendTo('.ml-item-list');
            }

            window.history.pushState('', $(document).find("title").text(), document.location.origin + '/itens?search=' + encodeURI(searchField));
            $('.ml-content .jumbotron').fadeIn('fast');
            preloaderFinish();

        }).fail(function (jqXHR, textStatus, data) {
            console.log(data);
            $('<span />', {
                'html': 'Ocorreu um problema na solicitação! Tente novamente mais tarde.'
            }).appendTo('.ml-item-list');
            preloaderFinish();
        });
    }
}

var apiItemDescription = function (productId) {
    if (productId != '') {
        $.ajax({
            url: '/apiItemAttributes',
            type: 'get',
            data: {
                id: encodeURI(productId)
            },
            dataType: 'json',
            beforeSend: function () {
                preloaderCall();
            }
        }).done(function (data) {
            breadcrumbLoad(data.title);
            $('.ml-content > .container > .jumbotron').empty();
            $('<div />', {
                'class': 'row ml-item-info',
                'html': [
                    $('<div />', {
                        'class': 'col-md-8',
                        'html': [
                            $('<img />', {
                                'class': 'ml-item-picture',
                                'src': data.pictures[0].url,
                                'alt': data.title
                            })
                        ]
                    }),
                    $('<div />', {
                        'class': 'col-md-4',
                        'html': [
                            $('<p />', {
                                'class': 'ml-item-state',
                                'html': data.condition + ' - ' + data.sold_quantity + ' Vendidos'
                            }),
                            $('<h4 />', {
                                'class': 'ml-item-title',
                                'html': data.title
                            }),
                            $('<h2 />', {
                                'class': 'ml-item-price',
                                'html': $('<input />', {
                                    'type': 'text',
                                    'value': data.price.toFixed(2),
                                    'readonly': true
                                }).priceFormat({
                                    prefix: 'R$ ',
                                    centsSeparator: ',',
                                    thousandsSeparator: '.',
                                    centsLimit: 2
                                })
                            }),
                            $('<button />', {
                                'class': 'btn btn-primary',
                                'html': 'Comprar'
                            }),
                        ]
                    })
                ]
            }).appendTo('.ml-content > .container > .jumbotron');

            $.ajax({
                url: '/apiItemDescription',
                type: 'get',
                data: {
                    id: encodeURI(productId)
                },
                dataType: 'json'
            }).done(function (data) {
                $('<div />', {
                    'class': 'row ml-item-details',
                    'html': [
                        $('<h4 />', {
                            'text': 'Descrição do Produto'
                        }),
                        $('<div />', {
                            'class': 'col-md-12',
                            'html': data.text
                        })
                    ]
                }).appendTo('.ml-content > .container > .jumbotron');
                preloaderFinish();
            }).fail(function (jqXHR, textStatus, data) {
                console.log(data);
                $('<span />', {
                    'html': 'Ocorreu um problema na solicitação! Tente novamente mais tarde.'
                }).appendTo('.ml-item-list');
                preloaderFinish();
            });

            window.history.pushState('', $(document).find("title").text(), document.location.origin + '/itens/' + encodeURI(productId));
            $('.ml-content .jumbotron').fadeIn('fast');

        }).fail(function (jqXHR, textStatus, data) {
            console.log(data);
            $('<span />', {
                'html': 'Ocorreu um problema na solicitação! Tente novamente mais tarde.'
            }).appendTo('.ml-item-list');
            preloaderFinish();
        });
    }
}

function uriNavigation() {
    //Check URL (Itens List)
    var url = document.location.toString();
    if (url.match('\\?')) {
        var searchField = decodeURI((url.split('?')[1]).split('=')[1]);
        apiSearchItens(searchField);
    }
    //Check URL
    var pathname = document.location.pathname.split('/');
    if (pathname.length > 2) {
        var productId = pathname[pathname.length - 1];
        apiItemDescription(productId);
    }
}

$(document).ready(function () {

    var cache = {};
    $('form[name=searchForm] input[name=search]').autocomplete({
        source: function (request, response) {
            var term = request.term;
            $('.ui-autocomplete-preloader-normal').stop(true, true).fadeIn('fast');
            if (term in cache) {
                $('.ui-autocomplete-preloader-normal').stop(true, true).fadeOut('fast');
                response($.map(cache[term].results, function (item) {
                    return {
                        value: item.title,
                        label: item.title
                    };
                }));
            }
            $.ajax({
                url: '/apiSearchItens',
                type: 'get',
                data: {
                    search: encodeURI(request.term)
                },
                dataType: 'json'
            }).done(function (data) {
                $('.ui-autocomplete-preloader-normal').stop(true, true).fadeOut('fast');
                cache[term] = data;
                response($.map(data.results, function (item) {
                    return {
                        value: item.title,
                        label: item.title
                    };
                }));
            });
        },
        minLength: 2
    });

    //Search Form
    $('form[name=searchForm]').submit(function (e) {
        e.preventDefault();
        apiSearchItens($('input[name=search]', this).val());
    });

    //Item Description
    $(document).on('click', '.ml-item-list dl', function () {
        apiItemDescription($(this).data("id"));
    });

    uriNavigation();

    if (window.history && window.history.pushState) {
        window.history.pushState('', null, './');
        $(window).on('popstate', function () {
            uriNavigation();
        });
    }

});