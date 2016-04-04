NPM_BIN = $(shell npm bin)

build: buildLib buildDist

buildDist:
	$(NPM_BIN)/webpack --config config/webpack.config.js &
	export NODE_ENV=production; \
	$(NPM_BIN)/webpack --config config/webpack.config.js -p

buildLib:
	for packageDir in packages/*/ ; do \
		$(NPM_BIN)/babel $$packageDir/src --out-dir $$packageDir/lib ; \
	done

cleanMergeDocs:
	git merge -s ours origin/gh-pages --no-edit
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
	cp -pR docs-static/* _docs

lint:
	$(NPM_BIN)/eslint packages/. --ext .js --cache

ifeq ($(TRAVIS_BRANCH)$(TRAVIS_PULL_REQUEST), masterfalse)
publishDocs: travisDocsSetup docs cleanMergeDocs commitDocsOnly
	git push origin gh-pages
else
publicDocs:
	@echo Not a master build, won't publish docs update.
endif

test: lint
ifeq ($(CI), true)
	$(NPM_BIN)/karma start config/karma.conf.js
else
	$(NPM_BIN)/karma start config/karma.dev.conf.js
endif

travisDocsSetup:
	git config user.name "Modern Uploader Travis-CI agent"
	git config user.email "info@fineuploader.com"
	git remote rm origin
	@git remote add origin "https://${GH_TOKEN}@${GH_REF}"
	git fetch --all
	git checkout master
