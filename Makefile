NPM_BIN = $(shell npm bin)

cleanMergeDocs:
	git merge -s ours gh-pages --no-edit
	git checkout gh-pages
	rm -rf docs
	cp -pR _docs docs

commitDocsOnly:
	git add docs
	git commit -a -m "publish docs update"

docs:
	rm -rf _docs
	for packageDir in packages/*/ ; do \
		$(NPM_BIN)/jsdoc $$packageDir -r -d _docs/$$packageDir --readme $$packageDir/README.md ; \
	done
	cp -pR docs-static/ _docs

publishDocs: travisDocsSetup docs cleanMergeDocs commitDocsOnly
	git push origin gh-pages
	git checkout master
	rm -rf docs

travisDocsSetup:
	git config user.name "Modern Uploader Travis-CI agent"
	git config user.email "info@fineuploader.com"
	git remote rm origin
	@git remote add origin "https://${GH_TOKEN}@${GH_REF}"
	git fetch --all
	git checkout master
