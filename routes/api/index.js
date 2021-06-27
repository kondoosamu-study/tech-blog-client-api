const express = require('express');
const router = express.Router();
const connection = require('../mysql');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

let getAllArticlesQuery = `SELECT A.id, A.title, C.name AS category, A.contents,
	T.name AS thumbnailName, T.url AS thumbnailUrl, T.full_path AS thumbnailFullPath,
	S.id AS seriesId, S.name AS series, A.series_order AS seriesOrder,
	DATE_FORMAT(A.created_at, '%Y-%m-%d %T') AS createdAt,
	DATE_FORMAT(A.updated_at, '%Y-%m-%d %T') AS updatedAt,
	DATE_FORMAT(A.deleted_at, '%Y-%m-%d %T') AS deletedAt, GROUP_CONCAT(tags.name) AS tags
	FROM articles AS A JOIN categories AS C ON C.id = A.category_id
		JOIN series AS S ON S.id = A.series_id
		JOIN thumbnails AS T ON T.id = A.thumbnail_id
		JOIN articles_tags AS AT ON AT.article_id = A.id
		JOIN tags ON tags.id = AT.tag_id
	WHERE A.deleted_at is NULL
	GROUP BY A.id
	ORDER BY A.updated_at desc;`;
let getCategoriesRankingQuery = `SELECT c.name AS category, COUNT(a.category_id) AS count
	FROM categories AS c LEFT JOIN articles AS a ON c.id = a.category_id
	GROUP BY c.id
	HAVING count > 0
	ORDER BY count desc;`;
let getCategorizeArticlesQuery = `SELECT A.id, A.title, C.name AS category,
	A.contents, T.name AS thumbnailName, T.url AS thumbnailUrl,
	T.full_path AS thumbnailFullPath, S.id AS seriesId, S.name AS series,
	A.series_order AS seriesOrder, DATE_FORMAT(A.created_at, '%Y-%m-%d %T') AS createdAt,
	DATE_FORMAT(A.updated_at, '%Y-%m-%d %T') AS updatedAt,
	DATE_FORMAT(A.deleted_at, '%Y-%m-%d %T') AS deletedAt, GROUP_CONCAT(tags.name) AS tags
	FROM articles AS A JOIN categories AS C ON C.id = A.category_id
	JOIN series AS S ON S.id = A.series_id
	JOIN thumbnails AS T ON T.id = A.thumbnail_id
	JOIN articles_tags AS AT ON AT.article_id = A.id
	JOIN tags ON tags.id = AT.tag_id
	WHERE C.name = ? AND A.deleted_at is NULL
	GROUP BY A.id
	ORDER BY A.updated_at desc;`;
let getArticlesRelatedToTagQuery = `SELECT A.id, A.title, C.name AS category,
		A.contents, T.name AS thumbnailName, T.url AS thumbnailUrl,
		T.full_path AS thumbnailFullPath, S.id AS seriesId, S.name AS series,
		A.series_order AS seriesOrder, DATE_FORMAT(A.created_at, '%Y-%m-%d %T') AS createdAt,
		DATE_FORMAT(A.updated_at, '%Y-%m-%d %T') AS updatedAt,
		DATE_FORMAT(A.deleted_at, '%Y-%m-%d %T') AS deletedAt,
		GROUP_CONCAT(tags.name) AS tags
	FROM articles AS A JOIN categories AS C ON C.id = A.category_id
		JOIN series AS S ON S.id = A.series_id
		JOIN thumbnails AS T ON T.id = A.thumbnail_id
		JOIN articles_tags AS AT ON AT.article_id = A.id
		JOIN tags ON tags.id = AT.tag_id
	WHERE tags.name LIKE ? AND A.deleted_at is NULL
	GROUP BY A.id
	ORDER BY A.updated_at desc;`;
let getArticlesFromSearchWordQuery = `SELECT A.id, A.title, C.name AS category,
	A.contents, T.name AS thumbnailName, T.url AS thumbnailUrl, T.full_path AS thumbnailFullPath,
	S.id AS seriesId, S.name AS series, A.series_order AS seriesOrder,
	DATE_FORMAT(A.created_at, '%Y-%m-%d %T') AS createdAt,
	DATE_FORMAT(A.updated_at, '%Y-%m-%d %T') AS updatedAt,
	DATE_FORMAT(A.deleted_at, '%Y-%m-%d %T') AS deletedAt,
	GROUP_CONCAT(tags.name) AS tags
	FROM articles AS A JOIN categories AS C ON C.id = A.category_id
		JOIN series AS S ON S.id = A.series_id
		JOIN thumbnails AS T ON T.id = A.thumbnail_id
		JOIN articles_tags AS AT ON AT.article_id = A.id
		JOIN tags ON tags.id = AT.tag_id
	WHERE A.title LIKE '%SEARCH_WORD%' OR C.name LIKE '%SEARCH_WORD%'
		OR A.contents LIKE '%SEARCH_WORD%' OR tags.name LIKE '%SEARCH_WORD%'
		NEXT_SEARCH_CRITERIA AND A.deleted_at is NULL
	GROUP BY A.id
	ORDER BY A.updated_at desc;`;
let replacementStringForSearch = `OR A.title LIKE '%SEARCH_WORD%' OR C.name LIKE '%SEARCH_WORD%' OR A.contents LIKE '%SEARCH_WORD%' OR tags.name LIKE '%SEARCH_WORD%' NEXT_SEARCH_CRITERIA `;
let getASpecificArticleQuery = `SELECT A.id, A.title, C.name AS category,
	A.contents, T.name AS thumbnailName, T.url AS thumbnailUrl,
	T.full_path AS thumbnailFullPath, S.id AS seriesId, S.name AS series,
	A.series_order AS seriesOrder, DATE_FORMAT(A.created_at, '%Y-%m-%d %T') AS createdAt,
	DATE_FORMAT(A.updated_at, '%Y-%m-%d %T') AS updatedAt,
	DATE_FORMAT(A.deleted_at, '%Y-%m-%d %T') AS deletedAt,
	GROUP_CONCAT(tags.name) AS tags
	FROM articles AS A JOIN categories AS C ON C.id = A.category_id
		JOIN series AS S ON S.id = A.series_id
		JOIN thumbnails AS T ON T.id = A.thumbnail_id
		JOIN articles_tags AS AT ON AT.article_id = A.id
		JOIN tags ON tags.id = AT.tag_id
	WHERE A.id = ? AND A.deleted_at is NULL
	GROUP BY A.id;`;

router.get('/test', (req, res) => {
	res.json('this is test api.');
});

router.get('/article/:id', (req, res) => {
	const id = req.params.id;
	connection.query(getASpecificArticleQuery, [id], (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	})
});

router.get('/articles', (req, res) => {
	connection.query(getAllArticlesQuery, (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	});
});

router.get('/category-ranking', (req, res) => {
	connection.query(getCategoriesRankingQuery, (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	});
});

router.get('/category/:name', (req, res) => {
	const name = req.params.name;
	connection.query(getCategorizeArticlesQuery, [name], (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	})
});

router.get('/tag/:name', async (req, res) => { 
	const name = req.params.name;
	connection.query(getArticlesRelatedToTagQuery, [name], (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	})
});

router.post('/search', async (req, res, next) => {
	let searchWords = req.body.searchWords;
	let getArticlesFromSearchWordQueryForExecuting = getArticlesFromSearchWordQuery;

	for (let searchWord of searchWords) {
		getArticlesFromSearchWordQueryForExecuting = getArticlesFromSearchWordQueryForExecuting.replace(/SEARCH_WORD/g, searchWord).replace('NEXT_SEARCH_CRITERIA', replacementStringForSearch);
	}
	getArticlesFromSearchWordQueryForExecuting = getArticlesFromSearchWordQueryForExecuting.replace(replacementStringForSearch, ' ');

	connection.query(getArticlesFromSearchWordQueryForExecuting, (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	})
})


module.exports = router;