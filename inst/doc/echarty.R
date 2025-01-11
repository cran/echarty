## ----include = FALSE----------------------------------------------------------
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>"
)

## ----opt, message=FALSE, echo=TRUE--------------------------------------------
# set/get global options
options('echarty.theme'='jazz') # set
getOption('echarty.theme')      # get
options('echarty.theme'=NULL)   # remove

