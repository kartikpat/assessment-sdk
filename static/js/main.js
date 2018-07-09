jQuery(document).ready( function() {
    var config = {
        "tags": {
            "tag1": 12345,
            "tag2": 123
        },
        "authorType": 1,
        "author": 123456,
        "association": 123456,
        "wrapperName": "container"
    }
    var test = new Test(config)
    test.init()
});
